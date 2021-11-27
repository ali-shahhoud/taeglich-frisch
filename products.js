'use strict';

const $ADD = document.querySelector('.add');
const $delete = document.querySelector('.delete');


let method;
function setMethodPost() {
  method = 'POST'
}

function setMethodDelete() {
  method = 'DELETE'
}



$ADD.addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log("xxxxxxxxxxxxxx", method);

  const req = new XMLHttpRequest();

  req.open(`${method}`, 'products.html');

  req.send(new URLSearchParams(new FormData($ADD)));

  req.addEventListener('load', function() {
    console.log(this.status);
    switch (this.status) {
      case 400:
        alert('bitte füllen sie alle Felder aus');
      break;
      case 200:
        alert('alles klarrr');
        break;
      case 405:
        alert('Bitte überprüfen Sie den Produktnamen');
        break;
    }

   console.log("ok");
   $ADD.reset();

  });
});
