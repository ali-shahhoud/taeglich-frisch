'use strict';



 let user = (document.querySelector('#navbarDropdown').innerHTML).replace(/\s/g, '')

console.log(user);

fetch('einkaufswagen.json').then(res => res.json()).then(data => {
console.log(data);
  for(let key in data) {

    let inninArr = data[key];
     if (key == user) {
        for(let key in inninArr) {

          (function adding() {
            document.querySelector('#card').innerHTML +=
            `
            <div class=" col col-12 col-md-6 col-lg-4 col-xl-3 outerCard"  id="${inninArr[key].productName}" align="center">
              <div class="card border-light card_in"  style="width: 15rem;" >
                <img src="/images/${inninArr[key].Image}" class="card-img-top  " alt="${key}" data-bs-toggle="modal" data-bs-target="#exampleModal${key}">
                <div class="card-body">
                  <h3 class="card-title mx-auto"  style="width: 200px;">${inninArr[key].productName}</h3>
                  <p class="card-text Preis">Preis :${inninArr[key].preis} €</p>
                  <a class="btn btn-danger opacity-75" onclick='deletFromCart(${JSON.stringify(inninArr[key])})'> Löschen </a>
                </div>
              </div>
            </div>
              <div class="modal fade " id="exampleModal${key}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header mx-auto bg-white">
                          ${inninArr[key].productName}
                        </div>
                        <div class="modal-body mx-auto ">
                              <p>

                              ursprungland: ${inninArr[key].ursprungland} <br>
                              sorte: ${inninArr[key].sorte}<br>
                              preis: ${inninArr[key].preis}
                              </p>
                        </div>

                  </div>
                </div>
              </div>
           `})()
        }
      }
    }
})
let summe = 0 ;

let conter = function(){ setTimeout(() => {let x = document.querySelectorAll(".Preis");
      const divsArr = Array.prototype.slice.call(x);

      for(let s in divsArr) {
            console.log( divsArr[s].textContent.replace( /[^\d\.]*/g,'').replace(".",","));
            summe += Number(divsArr[s].textContent.replace( /[^\d\.]*/g,''));
            console.log(summe);
            if (s == divsArr.length - 1) {
              document.querySelector("#summe").innerHTML = `summe = ${Math.trunc(summe)} €`
            }
      }
   }, 500)
}

conter();

function deletFromCart(product) {
  summe = 0;
  conter()
  if (document.querySelectorAll(".Preis").length == 1) {
    document.querySelector("#summe").innerHTML = `Sie haben noch keine Produkte ausgewählt`
  }

  const req = new XMLHttpRequest();

  req.open('POST', 'einkaufswagen.html');
  req.send(new URLSearchParams(product));

  req.addEventListener('load', function () {
    event.preventDefault();

    switch (this.status) {

      case 202:

        let myobj = document.getElementById(`${product.productName}`);
        myobj.remove();
        break;

      case 400:
        console.log('400');
        break;

      case 401:
        console.log('401');
        break;

      default:
        alert('un expected error');
        break;
    }
  });

}

