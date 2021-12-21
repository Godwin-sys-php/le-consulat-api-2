const _ = require('lodash');
const MoneyTransactions = require('../../Models/MoneyTransactions');

module.exports = (req, res, next) => {
  if ((req.body.description.length >= 2 && req.body.description.length <= 90 && _.isString(req.body.description)) && _.isNumber(req.body.amount) && (req.body.idCategory)) {
    MoneyTransactions.findOneCategory({ idCategory: req.body.idCategory })
      .then((category) => {
        category.length === 1 ? next() : res.status(400).json({ invalidForm: true });
      })
      .catch(err => {
        res.status(500).json({ error: true, errorMessage: err });
      })
  } else {
    res.status(400).json({ invalidForm: true });
  }
}