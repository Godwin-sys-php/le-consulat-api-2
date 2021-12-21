const _ = require('lodash');

module.exports = (req, res, next) => {
  if ((req.body.description.length >= 2 && req.body.description.length <= 90 && _.isString(req.body.description)) && _.isNumber(req.body.quantity)) {
    next();
  } else {
    res.status(400).json({ invalidForm: true });
  }
}