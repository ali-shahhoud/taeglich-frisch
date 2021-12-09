'use strict';

const {readFileSync,writeFileSync} = require('fs');

module.exports = (file, req, res) => {

  const SESSION = req.getSession();

      const loggedUser = SESSION.username;
      console.log(loggedUser);

      const fileData = JSON.parse(readFileSync('einkaufswagen.json'));

      switch (req.method) {
        case 'POST':
          req.postData(($_POST) => {

              console.log("$_POST",$_POST);

            for( var i = 0; i < fileData[loggedUser].length; i++){

                if ( fileData[loggedUser][i].productName == $_POST.productName) {
                  console.log("fileData[loggedUser][i]",fileData[loggedUser][i]);
                  fileData[loggedUser].splice(i, 1);


                  writeFileSync('einkaufswagen.json', JSON.stringify(fileData, null, 2));
                  return
                }
            }
          });
          res.statusCode = 202;
          break;
      }

  return file

};

