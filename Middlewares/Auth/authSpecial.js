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
          if (user[0].idUser === 1 || user[0].idUser === 2) {
            req.user = user[0];
            return next();
          }
          return res.status(403).json({ invalidToken: true, forbidden: true });
        }
      })
      .catch((error) => {

      console.log(error);
        res.status(500).json({ error: true, errorMessage: error });
      });
  } catch (error) {

    console.log(error);
    res.status(500).json({ error: true, errorMessage: error });
  }
};
