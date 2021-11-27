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


//
// HTTP.IncomingMessage.prototype.cookieData()
// -> Object
HTTP.IncomingMessage.prototype.cookieData = function() {
  return Object.fromEntries(new URLSearchParams((this.headers.cookie || '').replace('; ', '&')))
};


//
// HTTP.IncomingMessage.prototype.getData()
// -> Object
HTTP.IncomingMessage.prototype.getData = function() {
  return Object.fromEntries(new URL(this.url, 'http://localhost/').searchParams);
};


//
// HTTP.IncomingMessage.prototype.postData()
// Eingehende POST Daten des Benutzers sammeln, auf die Einhaltung der erlaubten Maximalgröße achten ein Objekt mit den Daten des Benutzers an das Callback übergeben.
// <- callback: Function<Object>
HTTP.IncomingMessage.prototype.postData = function(callback) {
  // Sammelvariable für die Stück für Stück eingelangenden Daten erstellen
  let chunks = '';

  // Alle eingelangenden Datenstück zusammensammeln
  this.on('data', (chunk) => {
    // Überprüfen, ob das erlaubten Größenlimit von erlaubten Daten eingehalten wird, ansonsten wird das weitere Sammeln von Daten unterbrochen.
    if (chunks.length + chunk.length > HTTP.POST_DATA_LIMIT) {
      // Nicht länger auf eingehende Daten warten und die gesammelten Daten verwerfen
      this.removeAllListeners('data');
      chunks = null;

      // Auf der Konsole einen Hinweis zum Überschreiten des Limit bei aktiviertem Logging anzeigen
      if (HTTP.SESSION_LOGGING) {
        print(`HTTP.IncomingMessage.prototype.postQueryData post payload size of ${HTTP.POST_DATA_LIMIT} bytes exceeded`);
      }

      // Callback Methoden beenden
      return;
    }

    // Wenn die Überprüfung des Limits in Ordnung war das Datenstück sammeln
    chunks += chunk;
  });

  // Auf das Event der vollendeten Übertragung der Daten warten und daraus ein neues Objekt mit den Daten des Query Strings erstellen und damit die Callback Methode aufrufen
  this.on('end', () => {
    callback(Object.fromEntries(new URLSearchParams(chunks)));
  });
};


//
// HTTP.IncomingMessage.prototype.getSession()
// Versuchen auf Basis der vom Benutzer übertragenen Cookies eine aktive Sitzung zu finden und deren Daten zurückgeben.
// -> Object<session: String, username: String, ...>?
HTTP.IncomingMessage.prototype.getSession = function() {
  // Überprüfen, ob irgendwelche Cookies übertragen wurden
  if (this.headers.cookie) {
    // Cookies abfragen
    const COOKIES = this.cookieData();

    // Überprüfen ob die übertragene Session ID in den aktuell existierenden Sessions existiert und wenn ja die Daten der Session zurückgeben
    if (HTTP.SESSIONS[COOKIES.session]) {
      return HTTP.SESSIONS[COOKIES.session].storage;
    }
  }

  // Gibt es keine Cookies oder keine Session so gibt es kein Ergebnis
  return null;
};


//
// HTTP.ServerResponse.prototype.setSession()
// <- storage: Object<session: String, username: String, ...>
HTTP.ServerResponse.prototype.setSession = function(storage) {
  // Einen Fehler werfen wenn kein Storage Objekt übergeben wurde
  if (!storage) throw new Error('HTTP.ServerResponse.prototype.setSession storage needs to be of type session object')

  // Ein Session Cookie mit der Session ID des Benutzers erstellen (HttpOnly verbietet den Client-seitigen Zugriff auf das Cookie mit JavaScript)
  this.setHeader('Set-Cookie',[ `session=${storage.session}; HttpOnly` , `username=${storage.username}` ]);
  // this.setHeader('Set-Cookie', `username=${storage.username}`);
  // Existiert bereits eine Session für die aktuelle Session ID, dann stoppen wir dessen Ablauf-Timer, sodass die Session nicht vorzeitig beendet wird.
  // Gibt es noch keine aktuelle Session, dann loggen wir bei aktiviertem Logging die Erstellung einer neuen Session.
  if (HTTP.SESSIONS[storage.session]) {
    clearTimeout(HTTP.SESSIONS[storage.session].timer);
  } else if (HTTP.SESSION_LOGGING) {
    print(`Sitzung von '${storage.username}' erstellt`);
  }

  // Aktuelle Session auf Basis ihrer ID speichern und ihr inhaltlich sowohl ihre Datenablage als auch den Verweis auf den Ablauf-Timer hinterlegen.
  // Die HTTP.SESSION_DURATION enthält die Ablauf-Zeit als Minuten, für einen Timeout müssen wir diese aber in Millisekunden umrechnen (*60 = Sekunden und dann *1000 = Millisekunden).
  HTTP.SESSIONS[storage.session] = {
    storage: storage,
    timer: setTimeout(() => this.deleteSession(storage), HTTP.SESSION_DURATION * 60 * 1000),
  };
};


//
// HTTP.ServerResponse.prototype.deleteSession()
// <- storage: Object<session: String, username: String, ...>
HTTP.ServerResponse.prototype.deleteSession = function(storage) {
  // Wurde kein Storage Objekt übergeben brechen wir vorzeitig ab
  if (!storage) return;

  // Ablauf-Timer stoppen und anschließend die Session Daten löschen
  clearTimeout(HTTP.SESSIONS[storage.session]);
  delete HTTP.SESSIONS[storage.session];

  // Bei aktiviertem Logging die beendete Sitzung loggen
  if (HTTP.SESSION_LOGGING) {
    print(`Sitzung von '${storage.username}' beendet`);
  }
}
