'use strict';

module.exports = (file, req, res) => {
  const SESSION = req.getSession();

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

