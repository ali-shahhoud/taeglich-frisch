'use strict';

'use strict';

// Vorbereitungen
const HTTP = require('http');
module.exports = HTTP;
const print = console.log;

// Einstellungen
HTTP.SESSIONS = {};
HTTP.SESSION_DURATION = 60;
HTTP.SESSION_LOGGING = true;
HTTP.POST_DATA_LIMIT = 1 * 1024 * 1024;


HTTP.IncomingMessage.prototype.cookieData = function() {
  return Object.fromEntries(new URLSearchParams((this.headers.cookie || '').replace(/; /g, '&')))
};


HTTP.IncomingMessage.prototype.getData = function() {
  return Object.fromEntries(new URL(this.url, 'http://localhost/').searchParams);
};


HTTP.IncomingMessage.prototype.postData = function(callback) {
  let chunks = '';

  this.on('data', (chunk) => {
    if (chunks.length + chunk.length > HTTP.POST_DATA_LIMIT) {
      this.removeAllListeners('data');
      chunks = null;

      if (HTTP.SESSION_LOGGING) {
        print(`HTTP.IncomingMessage.prototype.postQueryData post payload size of ${HTTP.POST_DATA_LIMIT} bytes exceeded`);
      }

      return;
    }

    chunks += chunk;
  });

  this.on('end', () => {
    callback(Object.fromEntries(new URLSearchParams(chunks)));
  });
};


HTTP.IncomingMessage.prototype.getSession = function() {
  if (this.headers.cookie) {
    const COOKIES = this.cookieData();

    if (HTTP.SESSIONS[COOKIES.session]) {
      return HTTP.SESSIONS[COOKIES.session].storage;
    }
  }

  return null;
};


HTTP.ServerResponse.prototype.setSession = function(storage) {
  if (!storage) throw new Error('HTTP.ServerResponse.prototype.setSession storage needs to be of type session object')

  this.setHeader('Set-Cookie', `session=${storage.session}; HttpOnly`);

  if (HTTP.SESSIONS[storage.session]) {
    clearTimeout(HTTP.SESSIONS[storage.session].timer);
  } else if (HTTP.SESSION_LOGGING) {
    print(`Sitzung von '${storage.username}' erstellt`);
  }

  HTTP.SESSIONS[storage.session] = {
    storage: storage,
    timer: setTimeout(() => this.deleteSession(storage), HTTP.SESSION_DURATION * 60 * 1000),
  };
};


HTTP.ServerResponse.prototype.deleteSession = function(storage) {
  if (!storage) return;
console.log(storage);
  clearTimeout(HTTP.SESSIONS[storage.session]);
  delete HTTP.SESSIONS[storage];
  delete HTTP.SESSIONS[storage.session];

  if (HTTP.SESSION_LOGGING) {
    print(`Sitzung von '${storage.username}' beendet`);
  }
}
