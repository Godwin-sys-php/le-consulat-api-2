const MoneyTransactions = require('../../Models/MoneyTransactions');

module.exports = (req, res, next) => {
  MoneyTransactions.findOneCategory({ idCategory: req.params.idCategory })
    .then(category => {
      if (category.length < 1) {
        res.status(400).json({ existName: true });
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json({ error: true, errorMessage: err });
    });
}