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

            // Hash Summe für den Benutzername und das Passwort mitsamt Salt berechnen
            const HASH = createHash('sha256').update(`${USERNAME}-${PASSWORD}-${SALT}`).digest('hex');

            // Salt für den Benutzer in der Datenbank abgleichen und somit einen erfolgreichen Login bearbeiten
            if (USERS[USERNAME] && USERS[USERNAME].password === HASH) {
              // Neue Session für den Benutzer starten. Mit `randomBytes` erhalten wir hier kryptografisch sichere 16 Byte an Zufallsdaten, welche wir als hexadezimale Zahl auslesen und als Session ID verwenden
              res.setSession({ session: randomBytes(16).toString('hex'), username: USERNAME });

              // Umleitung auf die Startseite durchführen
              res.statusCode = 302;
              res.setHeader('Location', 'index.html');
              res.end('302 Found');

              // Null zurückgeben. Dadurch wird in `server.js` erkannt, dass wir in diesem Script hier die Abfrage bereits fertig abgewickelt haben und sich der Server um nichts mehr kümmern muss.
              return null;
            }

            // Gelangen wir an diese Stelle, dann ist der Login nicht erfolgreich verlaufen und wir teilen dies dem Benutzer auf schlichte Weise mit
            print(`Fehlergeschlagener Login von '${USERNAME}'`);
            res.statusCode = 401;
            res.end('401 Unauthorized');
          } break;

          // Einen neuen Benutzer registrieren
          case 'register': {
            // Benutzername und Passwort aus der Anfrage extrahieren
            const USERNAME   = $_POST.username;
            const PASSWORD   = $_POST.password;
            const FIRST_NAME = $_POST.firstname;
            const LAST_NAME  = $_POST.lastname;

            // Überprüfen, ob eine Information fehlt oder ungültig ist
            if (!USERNAME || USERNAME.length > 50 || !PASSWORD || PASSWORD.length > 50 || !FIRST_NAME || FIRST_NAME.length > 50 || !LAST_NAME || LAST_NAME.length > 50) {
              res.statusCode = 400;
              res.end('400 Bad Request');
              return null;
            }

            // Überprüfen, ob der Benutzer bereits existiert
            if (USERS[USERNAME]) {
              res.statusCode = 409;
              res.end('409 Conflict');
              return null;
            }

            // Benutzer in der Datenbank anlegen
            USERS[USERNAME] = {
              firstname: FIRST_NAME,
              lastname: LAST_NAME,
              password: createHash('sha256').update(`${USERNAME}-${PASSWORD}-${SALT}`).digest('hex'),
            };

            // Datenbank speichern und entsprechende Meldung auf der Konsole anzeigen
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




            // Die Abarbeitung des Requests erfolgt intern
            return null;
          } break;

          // Alle anderen Anfragen sind ungültig
          default:
            res.statusCode = 400;
            res.end('400 Bad Request');
            return null;
          break;
        }
      });

      // Null zurückgeben. Dadurch wird in `server.js` erkannt, dass wir in diesem Script hier die Abfrage bereits fertig abgewickelt haben und sich der Server um nichts mehr kümmern muss.
      return null;
    break;

    // Alle anderen Anfragetypen behandeln
    default:
      // GET Daten empfangen
      const $_GET = req.getData();

      // Für den Fall dass der Schlüssel `logout` mittels GET Parameter übergeben wurde werden wir die aktuelle Benutzersitzung beenden und den Benutzer abmelden
      if ($_GET.logout !== undefined) {
        // Aktuelle Session abfragen und löschen
        console.log("ssssssssssssssss",req.getSession());
        res.deleteSession(req.getSession());

        // Umleitung auf die Login Seite durchführen
        res.statusCode = 302;
        res.setHeader('Location', 'login.html');
        res.end('302 Found');

        // Null zurückgeben. Dadurch wird in `server.js` erkannt, dass wir in diesem Script hier die Abfrage bereits fertig abgewickelt haben und sich der Server um nichts mehr kümmern muss.
        return null;
      }

      // Den Benutzernamen einsetzen, wenn er gegeben ist (passiert zum Beispiel nach einer Registrierung)
      // ACHTUNG: Angriffsmuster ohne Sanitizing!
      file = file.replace('%USERNAME%', ($_GET.username || '').replace(/[^A-Za-z0-9]/g, ''));
    break;
  }

  // Wenn weder ein POST Request zur Anmeldung noch eine Anfrage zum Abmelden mittels GET Parameter übertragen wurde, dann geben wir die Login Datei unbearbeitet zurück
  return file;
}
