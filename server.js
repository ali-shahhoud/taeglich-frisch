'use strict';

// Vorbereitungen
const print = console.log;
const { createServer } = require('./lib/http.js');
const { access, readFile, readFileSync, writeFileSync} = require('fs');
const { join } = require('path');
const mongoose = require('mongoose');
const Products = require('./_moduls/products.js')
const DB_URI = "mongodb+srv://ali:815173@cluster0.hidag.mongodb.net/ONLINE-SHOP?retryWrites=true&w=majority"

// const server ={
//   host: "mail.gmx.net",
//   port: 465,
//   username: "web-shop-taeglich-frisch@gmx.at",
//   password: "web@shop"
// }

const server = require('./server.json');

// Mailer Klasse laden und GMX Mailserver registrieren
const Mailer = require('./mailer.js');
const gmx = new Mailer(server);



// Einstellungen
const PORT = process.env.PORT || 8080;
const LOGIN_FILE = 'index.html';
const MIMETYPES = require('./mimetypes.json');

const BLOCKLIST = [
  'lib/http.js',
  'index.html.js',
  'login.html.js',
  'members.html.js',
  'mimetypes.json',
  'server.js',
  'users.json',
];
const HEADER = readFileSync('header.html', 'utf8');
const FOOTER = readFileSync('footer.html', 'utf8');

mongoose.connect(DB_URI).then((result) => console.log('connected to db')).catch((err) =>console.log(err));







const SERVER = createServer((req, res) => {
  const SESSION = req.getSession();
  if (SESSION) {
    print(`Neuer Request von '${SESSION.username}':`, req.url);
    res.setSession(SESSION);
  } else {
    print(`Neuer Request:`, req.url);
  }



  const URL_DETAILS = new URL(req.url, 'http://localhost/');

  const PATH = URL_DETAILS.pathname.substr(1) || LOGIN_FILE;

  const ABSOLUTE_PATH = join(process.cwd(), PATH);



  if (BLOCKLIST.includes(PATH) || !ABSOLUTE_PATH.startsWith(process.cwd())) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }


// start MONGOOOOOOOOOOS


  if (PATH === 'index.html') {
    Products.find({} , function (err, products) {
    if(err) throw err;
    writeFileSync('DB_products.json', JSON.stringify(products) , 'utf-8');
    });
  };


  if((req.method === 'POST') && (PATH === 'products.html')) {

    req.postData(($_POST) => {

        let newProd = Products({
              //id
                "productName": $_POST.Name,
                "preis": $_POST.preis,
                "kategorie": $_POST.kategorie,
                "ursprungland": $_POST.ursprung,
                "sorte": $_POST.sorte,
                "Image": $_POST.Image
        })
        if (!newProd.productName || !newProd.preis || !newProd.kategorie || !newProd.ursprungland  || !newProd.sorte || !newProd.Image) {
          res.statusCode = 400;
          return ;
        }

        newProd.save(function (err) {
          if (err) throw err;
          console.log("saaaaaavd");

        })
    })
  }
  console.log(res.statusCode);
  if((req.method === 'DELETE') && (PATH === 'products.html')) {

    req.postData(($_POST) => {

      let deletedProduct = $_POST.deleted;

      Products.deleteOne({ productName: `${deletedProduct}`}, (err,returns) => {
        if (err) { res.statusCode = 503;}
        if (returns.deletedCount === 0 ) {res.statusCode = 405; return}
      })

    })
  }
// end  MONGOOOOOOOOOOS

// start SMTP
if((req.method === 'POST') && (PATH === 'kontakt.html')) {

    req.postData(($_POST) => {

      const $subject = $_POST.subject;
      const $content = $_POST.content;
      const $to = $_POST.email;


      gmx.send({
        subject: $subject.value,
        content: $content.value,
        to: $to.value
      });
    })
}
// end SMTP

  readFile(PATH, (error, file) => {
    if (error) {
      res.statusCode = 404;
      res.end('404 Not Found');
      return;
    }

    access(`${PATH}.js`, (error) => {
      res.setHeader('Content-Type', MIMETYPES[PATH.split('.').pop()] || 'text/plain');

      if (PATH.split('.').pop() === 'html') {
        file = file.toString().replace('%HEADER%', HEADER).replace('%FOOTER%', FOOTER);
     }

      if (!error) {
        try {
          file = require(`./${PATH}.js`)(file, req, res);
        } catch(error) {
          print(`Error executing server side script of '${PATH}':`, error);
        }
        if (file === null) return;
      }

      res.end(file);
    });
  });
});

SERVER.listen(PORT);










