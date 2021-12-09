'use strict';

// Vorbereitungen
const { createHash, randomBytes } = require('crypto');
const { writeFile } = require('fs');
const print = console.log;

// Einstellungen
const SALT = '345840d1e83f80c0b5b47e64f91e0627';
const USERS = require('./users.json');
const einkaufswagen = require('./einkaufswagen.json');

// Default Export zur Bearbeitung der `login.html` Datei
module.exports = (file, req, res) => {
  // Die Datei wird als Buffer übermittelt, daher muss diese zunächst in einen String umgewandelt werden
  file = file.toString();

  // Die Anfragemethode überprüfen, also zB `GET` oder `POST`
  switch (req.method) {
    // POST Request werden für den Login verwendet
    case 'POST':
      // Eingehende POST Daten aus der Anfrage extrahieren
      req.postData(($_POST) => {

        // Übergebenen Typ prüfen, um die durchzuführende Aktivität zu bestimmen
        switch ($_POST.type) {

          // Den Benutzer anmelden
          case 'login': {

            // Benutzername und Passwort aus der Anfrage extrahieren
            const USERNAME = $_POST.username;
            const PASSWORD = $_POST.password;

            // Überprüfen ob eine Information fehlt oder ungültig ist
            if (!USERNAME || USERNAME.length > 50 || !PASSWORD || PASSWORD.length > 50) {
              res.statusCode = 400;
              res.end('400 Bad Request');
              return null;
            }

            const HASH = createHash('sha256').update(`${USERNAME}-${PASSWORD}-${SALT}`).digest('hex');

            if (USERS[USERNAME] && USERS[USERNAME].password === HASH) {
              res.setSession({ session: randomBytes(16).toString('hex'), username: USERNAME });

              res.statusCode = 302;
              res.setHeader('Location', 'index.html');
              res.end('302 Found');
              return null;
            }

            print(`Fehlergeschlagener Login von '${USERNAME}'`);
            res.statusCode = 401;
            res.end('401 Unauthorized');
          } break;

          case 'register': {
            const USERNAME   = $_POST.username;
            const PASSWORD   = $_POST.password;
            const FIRST_NAME = $_POST.firstname;
            const LAST_NAME  = $_POST.lastname;

            if (!USERNAME || USERNAME.length > 50 || !PASSWORD || PASSWORD.length > 50 || !FIRST_NAME || FIRST_NAME.length > 50 || !LAST_NAME || LAST_NAME.length > 50) {
              res.statusCode = 400;
              res.end('400 Bad Request');
              return null;
            }

            if (USERS[USERNAME]) {
              res.statusCode = 409;
              res.end('409 Conflict');
              return null;
            }

            USERS[USERNAME] = {
              firstname: FIRST_NAME,
              lastname: LAST_NAME,
              password: createHash('sha256').update(`${USERNAME}-${PASSWORD}-${SALT}`).digest('hex'),
            };

            writeFile('users.json', JSON.stringify(USERS, null, 2), (error) => {
              if (error) {
                // Fehler loggen
                print(`Fehler beim Speichern des neuen Benutzers '${USERNAME}'`, error);

                // Fehler an den Client senden
                res.statusCode = 500;
                res.end('500 Internal Server Error');
              } else {
                // Erfolg loggen
                print(`Benutzer '${USERNAME}' registriert`);

                // Umleitung auf die Login Seite durchführen
                res.statusCode = 302;
                res.setHeader('Location', `login.html?username=${encodeURIComponent(USERNAME)}`);
                res.end('302 Found');
              }
            });

            einkaufswagen[USERNAME]=[];
            writeFile('einkaufswagen.json', JSON.stringify(einkaufswagen, null, 2), (error) => {
              if (error) {

                print( error);

                // Fehler an den Client senden
                res.statusCode = 500;
                res.end('500 Internal Server Error');
              }
            });
            return null;
          } break;

          default:
            res.statusCode = 400;
            res.end('400 Bad Request');
            return null;
          break;
        }
      });

      return null;
    break;

    default:
      // GET Daten empfangen
      const $_GET = req.getData();

      if ($_GET.logout !== undefined) {
        // Aktuelle Session abfragen und löschen
        res.deleteSession(req.getSession());
        res.deleteSession(req.getSession());
        res.statusCode = 302;
        res.setHeader('Location', 'login.html');
        res.end('302 Found');

        return null;
      }


    break;
  }

  return file;
}
