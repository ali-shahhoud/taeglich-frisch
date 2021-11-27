'use strict';

(async () => {
  const Mailer = require('./mailer.js');
  const gmx = new Mailer(server);

  const $form = document.querySelector('form');
  const $to = document.querySelector('[name="email"]');
  const $subject = document.querySelector('[name="subject"]');
  const $content = document.querySelector('[name="content"]');


  // Absenden des Formulars erkennen und E-Mail Versand abwickeln
  $form.addEventListener('submit', async (event) => {
    // Formular nicht durch den Browser versenden
    event.preventDefault();


    const antwort = gmx.send({
      to: $to.value,
      subject: $subject.value,
      content: $content.value,
    });

    console.log(await antwort);
  });

})();
