const _ = require('lodash');
const Clients = require('../../Models/Clients');
const Users = require('../../Models/Users');

module.exports = (req, res, next) => {
console.log("coucou", req.notUseToken);
	if (!req.notUseToken) {
  
  Users.findOne({ idUser: req.user.idUser })
    .then(user => {
      if (user.length < 1) {
        res.status(400).json({ userNotFound: true });
      } else {
        if (req.body.idClient) {
          Clients.findOne({ idClient: req.body.idClient })
            .then(client => {
              req.user = user[0];
              client.length < 1 ? res.status(400).json({ clientNotFound: true }) : next();
            })
            .catch((error) => {
              res.status(500).json({ error: true, errorMessage: error });
            });
        } else {
          req.body.nameOfServer.length > 0 && req.body.nameOfServer.length <= 75 ? next() : res.status(400).json({ invalidForm: true });
        }
      }
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
	} else { return next(); }
};
