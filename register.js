'use strict';

// Vorbereitung
const print = console.log;

// Registrierungsformular holen
const $FORM = document.querySelector('form');


// Submit Event des Formulars verhindern, sodass wir mit Hilfe des XMLHttpRequest die Anfrage selbst steuern können
$FORM.addEventListener('submit', (event) => {
  // Standardaktion (das versenden des Formulars durch den Browser) verhindern
  event.preventDefault();

  // Neues Request Objekt erstellen
  const req = new XMLHttpRequest();

  // POST Request vorbereiten und mit den Informationen aus dem Formular kodiert als Query String an den Server senden
  // Achtung: Auch hier verwenden wir als Ziel die Login Seite, da diese den Registrierungsprozess bearbeitet.
  req.open('POST', 'login.html');
  req.send(new URLSearchParams(new FormData($FORM)));

  // Ergebnis der Anfrage anhand des HTTP Status Codes verarbeiten
  req.addEventListener('load', function() {
    switch (this.status) {
      // Status Code 200 wird zwar Server-seitig nie gesendet, er ist aber das Resultat der automatische Verfolgung des Status Code 302 (erfolgreicher Login) durch das XMLHttpRequest Objektes. Deswegen erkennen wir über den Code 200 eine erfolgreiche Registrierung und leiten den Browser weiter auf die Adresse `responseURL`, welche die Login Seite enthält, auf die der 302 Header `Location` verweist.
      case 200:
        alert('Registrierung erfolgreich');
        location.href = this.responseURL;
      break;

      // Status Code 400 (Bad Request) wird Server-seitig gesendet, wenn unsere Client-seitig gesendeten Daten nicht den formellen Anforderungen entsprechen. Client-seitig leeren wir inhaltlich das komplette Formular und fokussieren anschließend das Benutzername Feld.
      case 400:
        alert('Ungültige Anfrage');
        $FORM.reset();
        $FORM.elements.username.focus();
      break;

      // Status Code 409 (Conflict) wird vom Server zurückgegeben, wenn bereits ein Benutzer mit dem selben Namen registriert ist. Client-seitig leeren wird den Inhalt des Benutzername Feldes und fokussieren es anschließend.
      case 409:
        alert('Benutzer ist bereits vergeben');
        $FORM.elements.username.value = '';
        $FORM.elements.username.focus();
      break;

      // Alle anderen Fehler, beispielsweise ein 500er, sollten normalerweise nicht auftreten und falls doch teilen wir dies dem Benutzer ohne weiteren Details einfach mit.
      default:
        alert('Ein unbekannter Fehler ist aufgetreten');
      break;
    }
  });
});
