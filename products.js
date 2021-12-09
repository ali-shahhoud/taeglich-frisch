'use strict';

const $ADD = document.querySelector('.add');
const $delete = document.querySelector('.delete');

let method;
function setMethodPost() {
  method = 'PATCH'
}

function setMethodDelete() {
  method = 'DELETE'
}

fetch('DB_products.json').then(res => res.json()).then(data => {

  for(var key in data) {
    document.querySelector('#select').innerHTML +=
    `
    <option value="${data[key].productName}" name="deleted">${data[key].productName}</option>
    `
  }
})


$ADD.addEventListener('submit', async (event) => {
  event.preventDefault();

  const req = new XMLHttpRequest();
console.log(method);
  req.open(`${method}`, 'products.html');

  req.send(new URLSearchParams(new FormData($ADD)));

  req.addEventListener('load', function() {
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
        alert('alles klarrr');
        break;
    }

   $ADD.reset();

  });
});

const inpFile = document.querySelector('#inpFile');
const btnUpload = document.querySelector('#btnUpload');
btnUpload.addEventListener('click', function() {


 const xhr = new XMLHttpRequest();
 const formData = new FormData();
 let file = inpFile.files[0];
 formData.append("myFile", file);
 xhr.open("post", "products.html");

 xhr.send(formData);
 xhr.addEventListener('load', function() {
  console.log(this.status);
  switch (this.status) {
    case 500:
      alert('Server ERROR');
    break;
    case 400:
      alert('Ungültige Anfrage');
    break;
    case 402:
      alert('Bitte entsprechendes Bild hochladen');
    break;
    case 404:
      alert('nicht gefunden');
      break;
    case 202:
      alert('alles klarrr');
      break;
     }
   })
})


























