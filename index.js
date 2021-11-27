'use strict';





fetch('DB_products.json').then(res => res.json()).then(data => {



  for(var key in data) {


    document.querySelector('#card').innerHTML +=
    `
    <div class=" col col-12 col-md-6 col-lg-4 col-xl-3 outerCard"  id="${key}">
      <div class="card border-light card_in"  style="width: 15rem;" >
        <img src="${data[key].Image}" class="card-img-top  " alt="${key}" data-bs-toggle="modal" data-bs-target="#exampleModal${key}">
        <div class="card-body">
          <h3 class="card-title mx-auto"  style="width: 200px;">${data[key].productName}</h3>
          <p class="card-text">Preis :${data[key].preis} €</p>
          <a class="btn btn-danger opacity-75" onclick='addToCart(${JSON.stringify(data[key])})'> In den Einkaufswagen </a>
        </div>
      </div>
    </div>
      <div class="modal fade " id="exampleModal${key}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header mx-auto bg-white">
                  ${data[key].productName}
                </div>
                <div class="modal-body mx-auto ">
                      <p>

                      ursprungland: ${data[key].ursprungland} <br>
                      sorte: ${data[key].sorte}<br>
                      preis: ${data[key].preis}
                      </p>
                </div>

          </div>
        </div>
      </div>
 `
  }

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
