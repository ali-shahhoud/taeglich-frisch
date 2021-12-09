'use strict';

// Vorbereitungen
const print = (text) => console.log(text) || text;
const { connect } = require('tls');

// class Mailer
module.exports = class Mailer {

  // Private Attribute vorbereiten
  #host;
  #port;


  constructor(options) {
    this.#host = options.host;
    this.#port = options.port;


  }


  send(options) {

    const [ resolve, promise ] = (() => {
      let resolve;
      const promise = new Promise((resolver) => resolve = resolver);
      return [ resolve, promise ];
    })();

    const result = {
      onprogress: () => {},
      error: null,
      sent: promise,
    };

    const queue = [
      ['', 220],
      ['EHLO smtp.test', 250],
      ['AUTH LOGIN', 334],
      [Buffer.from('taeglichfrisch@gmx.net').toString('base64'), 334],
      [Buffer.from('web@shop').toString('base64'), 235],
      [`MAIL FROM: taeglichfrisch@gmx.net`, 250],
      [`RCPT TO: web-shop-taeglich-frisch@gmx.at`, 250],
      ['DATA', 354],
      [
        [
          'Content-Type: text/plain',
          `From: taeglichfrisch@gmx.net`,
          `To: web-shop-taeglich-frisch@gmx.at`,
          `Subject: ${Buffer.from(options.subject).toString('base64')}`,
          '',

          `${options.content} \n \n \n \n \n ${options.from}`,


          '.',
        ].join('\r\n'),
        250
      ],
      ['QUIT', 221],
    ];

    const total = queue.length;

    // Verbindung zum Mail Server herstellen
    const socket = connect({ host: this.#host, port: this.#port });

    // Erfolgreichen Verbindungsaufbau loggen
    socket.on('connect', () => {
      print('[Connection established]');
    });


    socket.on('error', (error) => {
      print(`[Connection error: ${error}]`);
      resolve(false);
      socket.end();
    });

    // Antworten des Servers verarbeiten
    socket.on('data', (data) => {
      // Eingehende Daten in String umwandeln (von Buffer) und die Enden abschneiden
      data = data.toString().trim();
      print(data);


      const code = parseInt(data.split(' ')[0])

      const [, expectedCode] = queue.shift();

      result.onprogress(1 - queue.length / total);

      if (!queue.length) {
        resolve(true);
        return socket.end();
      }

      if (expectedCode !== code) {
        print(`[Error: Expected code ${expectedCode}]`);
        resolve(false);
        return socket.end();
      }

      socket.write(print(queue[0][0]) + '\r\n');
    });

    // Erfolgte Verbindungstrennung loggen
    socket.on('end', (data) => {
      print('[Connection closed]');
    });

    // Rückgabewert
    return result;
  }

}

