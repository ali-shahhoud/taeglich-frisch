'use strict';

// Vorbereitung
const print = console.log;

const $FORM = document.querySelector('form');

$FORM.addEventListener('submit', (event) => {
  event.preventDefault();

  const req = new XMLHttpRequest();

  req.open('POST', 'login.html');
  req.send(new URLSearchParams(new FormData($FORM)));

  req.addEventListener('load', function() {
    switch (this.status) {
      case 200:
        location.href = this.responseURL;
      break;

      case 400:
        alert('Ungültige Anfrage');
        $FORM.reset();
        $FORM.elements.username.focus();
      break;

      case 401:
        alert('Login fehlgeschlagen');
        $FORM.elements.password.value = '';
        $FORM.elements.password.focus();
      break;

      default:
        alert('Ein unbekannter Fehler ist aufgetreten');
      break;
    }
  });
});
