'use strict';


  const $form = document.querySelector('form');
  const $from = document.querySelector('[name="email"]');
  const $subject = document.querySelector('[name="subject"]');
  const $content = document.querySelector('[name="content"]');

  const $sending = document.querySelector('.sending');
  const $status = document.querySelector('.status');
  const $progress = document.querySelector('progress');
  const $continue = document.querySelector('.continue');


$form.addEventListener('submit',  (event) => {

    event.preventDefault();
    const cancelKeyboardInput = (event) => { event.preventDefault() };
    window.addEventListener('keydown', cancelKeyboardInput);

    $sending.hidden = false;
    $status.textContent = 'Sende Nachricht...';
    $progress.removeAttribute('value');

    const req = new XMLHttpRequest();

      req.open('POST', 'kontakt.html');

      req.send(new URLSearchParams(new FormData($form)));

      req.addEventListener('load',async function() {
        console.log(this.status);
        switch (this.status) {
          case 500:
            alert('Server ERROR');
          break;
          case 400:
            alert('Bitte alle Felder ausfüllen und das entsprechende Bild hochladen');
          break;
          case 401:
            alert('Bitte stellen Sie sicher, dass der Produktname und der Bildname übereinstimmen');
          break;
          case 404:
            alert('Bitte überprüfen Sie den Produktnamen');
            break;
          case 202:


            $from.value = '';
            $subject.value = '';
            $content.value = '';
            $status.textContent= 'Klicken zum Fortsetzen';
            $progress.value = 100;
            await new Promise((resolve) => window.addEventListener('click', resolve, { once: true }));
            window.removeEventListener('keydown', cancelKeyboardInput);
            $sending.hidden = true;
            break;
        }
      });
  })


function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

let user = readCookie("username")


if (user) {
  document.getElementById("navbarDropdown").innerHTML = user;
  if(user === 'admin') {
    document.querySelector('.dropdown-menu').innerHTML += '<li><a class="dropdown-item" href="products.html?logout">Products</a></li>'
  }
}

if(!user) {

  document.querySelector('#log').textContent = 'Login'
}
