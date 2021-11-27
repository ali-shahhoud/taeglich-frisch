
'use strict';

const {readFileSync,writeFileSync} = require('fs');

module.exports = (file, req, res) => {

    const SESSION = req.getSession();

    const loggedUser = SESSION.username;

    const fileData = JSON.parse(readFileSync('einkaufswagen.json'));


    switch (req.method) {
      case 'POST':
      req.postData(($_POST) => {

        fileData[loggedUser].push($_POST);

        writeFileSync('einkaufswagen.json', JSON.stringify(fileData, null, 2));

      });

      break;

    }

  return file
    .toString()
    .replace("Gast", () => {
      if (SESSION) {
        return `${SESSION.username} `;
      } else {
        return ` <a href="login.html">Zum Login.</a>`;
      }
    })

};

