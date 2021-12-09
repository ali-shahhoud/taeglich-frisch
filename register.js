'use strict';

// Vorbereitung
const print = console.log;

// Registrierungsformular holen
const $FORM = document.querySelector('form');


$FORM.addEventListener('submit', (event) => {

  event.preventDefault();

  // Neues Request Objekt erstellen
  const req = new XMLHttpRequest();


  req.open('POST', 'login.html');
  req.send(new URLSearchParams(new FormData($FORM)));


  req.addEventListener('load', function() {
    switch (this.status) {
      case 200:
        alert('Registrierung erfolgreich');
        location.href = this.responseURL;
      break;

      case 400:
        alert('Ungültige Anfrage');
        $FORM.reset();
        $FORM.elements.username.focus();
      break;

      case 409:
        alert('Benutzer ist bereits vergeben');
        $FORM.elements.username.value = '';
        $FORM.elements.username.focus();
      break;

      default:
        alert('Ein unbekannter Fehler ist aufgetreten');
      break;
    }
  });
});
