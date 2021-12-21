const Clients = require('../../Models/Clients');

module.exports = (req, res, next) => {
  Clients.findOne({ idClient: req.params.idClient })
    .then((client) => {
      client.length < 1 ? res.status(400).json({ clientNotFound: true }) : next();
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};