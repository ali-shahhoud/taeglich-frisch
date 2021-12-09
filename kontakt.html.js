'use strict';


  const server = require('./server.json');
  const Mailer = require('./mailer.js');
  const gmx = new Mailer(server);


 module.exports = (file, req, res) => {

      switch (req.method) {
        case 'POST':
          req.postData(async($_POST) => {

              const antwort = gmx.send({
                from: $_POST.email,
                subject: $_POST.subject,
                content: $_POST.content,
              });

              if (await antwort.sent) {
                res.statusCode = 202;
                res.end('202');
                return null}
            });return null
          break;

    }
   return file
  };


