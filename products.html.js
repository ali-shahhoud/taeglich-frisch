'use strict';

const FS = require('fs');
const formidable = require('formidable');


let imageName = "";
let imageUp = false;

module.exports = (file, req, res) => {
  const SESSION = req.getSession();

  const Products = require('./_moduls/products.js');

  switch (req.method) {

    case 'POST':{

    const form = new formidable.IncomingForm();

    form.uploadDir = 'images'  ;

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.statusCode = 500;
        return null;
      }
  try{
     FS.rename(`./images/${files.myFile.newFilename}` , `./images/${files.myFile.originalFilename}`,(err) => console.log(err));
     imageName = `${files.myFile.originalFilename}`;
     imageUp = true;
     res.statusCode = 202;
     res.end("202");}

     catch(err){res.statusCode = 402; res.end("402")}

    });

    return null;

  } break;
    case 'PATCH':{

        req.postData(($_POST) => {


            let newProd = Products({
                  //id
                    "productName": $_POST.Name,
                    "preis": $_POST.preis,
                    "kategorie": $_POST.kategorie,
                    "ursprungland": $_POST.ursprung,
                    "sorte": $_POST.sorte,
                    "Image": `${imageName}`
            })
            if (!newProd.productName || !newProd.preis || !newProd.kategorie || !newProd.ursprungland  || !newProd.sorte || !newProd.Image) {
              res.statusCode = 400;
              res.end('400');
              return null
            }
            console.log(newProd.Image.toLowerCase());
            console.log(newProd.productName.toLowerCase());
              if (imageUp == false) {
              res.statusCode = 401;
              res.end('401');
              return null
            }

            newProd.save(function (err) {
              if (err) throw err;
              imageUp = false;
              res.statusCode = 202;
              res.end('202');
              return null
            })

        }) ;return null
    } break;

    case 'DELETE':{

      req.postData( ($_POST) => {

        let deletedProduct = $_POST.deleted;


          Products.deleteOne({ productName: `${deletedProduct}`},(error,returns) => {
            if (error) {
              // Fehler loggen
              print(`Fehler beim Speichern des neuen Benutzers '${USERNAME}'`, error);

              // Fehler an den Client senden
              res.statusCode = 500;
              res.end('500');
            } else {
              // Erfolg loggen
              console.log("ssasas");
              console.log(returns.deletedCount);
              if (returns.deletedCount == 1){
                res.statusCode = 202;
                res.end('202');
                } else {
              res.statusCode = 404;
              res.end('404');

                }
            }
          }) ;
      })
      return null
    }break;
  }
  return file
}

