const jwt = require('jsonwebtoken');
const Users = require('../../Models/Users');

require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);
    Users.findOne({ idUser: decodedToken.idUser })
      .then(user => {
        if (user.length < 1) {
          res.status(400).json({ invalidToken: true, notFoundUser: true });
        } else {
          user[0].level === 1 || (req.params.idUser == user[0].idUser && req.params.idUser == decodedToken.idUser) ? next() : res.status(403).json({ invalidToken: true, forbidden: true });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  } catch (error) {
    res.status(500).json({ error: true, errorMessage: error });
  }
};
