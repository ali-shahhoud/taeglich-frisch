'use strict';

// Vorbereitungen
const print = (text) => console.log(text) || text;
const { connect } = require('tls');  // Verschlüsselte Verbindungen



// function encodeBase64(msg) {
//   return btoa(encodeURIComponent(msg).replace(/%([0-9A-F]{2})/g, (_, char) => {
//     return String.fromCharCode(`0x${char}`);
//   }));
// }
function encodeBase64(msg) {
Buffer.from(encodeURIComponent(msg).replace(/%([0-9A-F]{2})/g, (_, char) => {
  return String.fromCharCode(`0x${char}`);
})).toString('base64')

}

//
// class Mailer
module.exports = class Mailer {

  // Private Attribute vorbereiten
  #host;
  #port;
  #username;
  #password;


  //
  // constructor()
  // <- options: Object<host: String, port: Number, username: String, password: String>
  constructor(options) {
    this.#host = options.host;
    this.#port = options.port;
    this.#username = options.username;
    this.#password = options.password;
  }


  //
  // send()
  // <- options: Object<to: String, subject: String, content: String>
  // -> Promise<Boolean>
  send(options) {
    // Promise und dessen `resolve` Methode extrahieren (über ein IFFE, damit beide
    // als Konstante gespeichert werden können)
    const [ resolve, promise ] = (() => {
      let resolve;
      const promise = new Promise((resolver) => resolve = resolver);
      return [ resolve, promise ];
    })();

    // Das `result` Objekt erstellen, welches von dieser Methode zurückgegeben wird
    const result = {
      onprogress: () => {},
      error: null,
      sent: promise,
    };

    // Warteschlange mit den abzuarbeitenden Befehlen, die wir an den SMTP Server senden
    const queue = [
      ['', 220],
      ['EHLO smtp.test', 250],
      ['AUTH LOGIN', 334],
      [this.#username, 334],
      [this.#password, 235],
      [`MAIL FROM: ${this.#username}`, 250],
      [`RCPT TO: ${options.to}`, 250],
      ['DATA', 354],
      [
        [
          'Content-Type: text/plain',
          `From: ${this.#username}`,
          `To: ${options.to}`,
          `Subject: =?UTF-8?B?${options.subject}?=`,
          '',
          // Zeilenumbrüche im Nachrichtentext richtig einrücken sowie alle Zeilen,
          // welche mit einem Punkt beginnen mit einem weiteren vorangestellten
          // Punkt maskieren
         "...options.content",

          '.',
        ].join('\r\n'),
        250
      ],
      ['QUIT', 221],
    ];

    // Die ursprüngliche Länge der Warteschlange merken, sodass auf deren Basis in
    // weiterer Folge die Berechnung des Fortschritts erfolgen kann
    const total = queue.length;

    // Verbindung zum Mail Server herstellen
    const socket = connect({ host: this.#host, port: this.#port });

    // Erfolgreichen Verbindungsaufbau loggen
    socket.on('connect', () => {
      print('[Connection established]');
    });

    // Fehler der Verbindung handhaben, Verbindung trennen und das Promise mit einem
    // Misserfolg auflösen.
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

      // Den dreistelligen Antwort-Code der Antwort extrahieren, zB 220 von
      // `220 gmx.net (mrgmx105) Nemesis ESMTP Service ready`
      const code = parseInt(data.split(' ')[0])

      // Den aktuell ersten Eintrag aus der Warteschlange extrahieren und den erwarteten
      // Antwort Code des Servers merken
      const [, expectedCode] = queue.shift();

      // Die Methode zur Verfolgung des Fortschritts mit dem aktuellen Fortschrittswert
      // (zwischen 0 und 1) aufrufen
      result.onprogress(1 - queue.length / total);

      // Wenn die Warteschlange leer ist, dann beenden wir unsererseits die Verbindung
      // und lösen das Promise mit einer Erfolgsmeldung auf.
      if (!queue.length) {
        resolve(true);
        return socket.end();
      }

      // Hat der Server einen anderer Code zurückgegeben als wir erwarten trennen wir
      // unsererseits die Verbindung (damit keine ungültigen Befehle ausgeführt werden
      // oder schlimmstenfalls Daten leaken).
      // Des Weiteren wird das Promise mit einem negativen Boolean aufgelöst.
      if (expectedCode !== code) {
        print(`[Error: Expected code ${expectedCode}]`);
        resolve(false);
        return socket.end();
      }

      // Nach erfolgreichen Überprüfung der Eingangsdaten senden wir den nächsten
      // Befehlt der Warteschlange an den Server
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

