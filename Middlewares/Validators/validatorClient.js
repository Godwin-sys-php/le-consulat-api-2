const Clients = require('../../Models/Clients');
const _ = require('lodash');

module.exports = (req, res, next) => {
  try {
    if (req.method == "PUT") {
      if (
        (req.body.name.length >= 2 && req.body.name.length <= 50 && _.isString(req.body.name))) {
        Clients.findOneWithoutAnID({ name: req.body.name }, req.params.idClient)
          .then((user) => {
            user.length < 1 ? next() : res.status(400).json({ existName: true });
          })
          .catch((error) => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      } else {
        res.status(400).json({ invalidForm: true });
      }
    } else {
      if ((req.body.name.length >= 2 && req.body.name.length <= 50 && _.isString(req.body.name))) {
        Clients.findOne({ name: req.body.name })
          .then((user) => {
            user.length < 1 ? next() : res.status(400).json({ existName: true });
          })
          .catch((error) => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      } else {
        res.status(400).json({ invalidForm: true });
      }
    }
  } catch (error) {
    res.status(500).json({ error: true, errorMessage: error });
  }
};