const Sessions = require('../../Models/Sessions');

module.exports = (req, res, next) => {
  Sessions.find({ idSession: req.params.idSession })
    .then((session) => {
      req.session = session[0];
      session.length < 1 ? res.status(400).json({ sessionNotFound: true }) : next();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};