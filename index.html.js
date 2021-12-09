
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

        fileData[loggedUser].push($_POST);

        writeFileSync('einkaufswagen.json', JSON.stringify(fileData, null, 2));
        res.statusCode = 202;
        res.end('401 Unauthorized');
      });
      return null
      break;

    }

  return file

};

