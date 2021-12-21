const Users = require('../../Models/Users');

module.exports = (req, res, next) => {
  Users.findOne({ idUser: req.params.idUser })
    .then((user) => {
      user.length < 1 ? res.status(400).json({ userNotFound: true }) : next();
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};