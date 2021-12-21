const Sessions = require("../../Models/Sessions");

module.exports = (req, res, next) => {
  Sessions.find({ idSession: req.params.idSession })
    .then(session => {
      session[0].wasOver ? next() : res.status(400).json({ sessionIsNotFinish: true });
    })
    .catch((error) => {

      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};