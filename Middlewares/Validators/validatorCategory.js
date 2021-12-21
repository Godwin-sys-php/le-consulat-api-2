const _ = require('lodash');

module.exports = (req, res, next) => {
  if (req.method === 'PUT') {
    if (_.isString(req.body.name) && req.body.name.length >= 2 && req.body.name.length <= 70) {
      next();
    } else {
      res.status(400).json({ invalidForm: true });
    }
  } else {
    if ((req.body.type.length >= 2 && req.body.type.length <= 70 && _.isString(req.body.type) && (req.body.type === 'enter' || req.body.type === 'outlet')) && (_.isString(req.body.name) && req.body.name.length >= 2 && req.body.name.length <= 70 )) {
      next();
    } else {
      res.status(400).json({ invalidForm: true });
    }
  }
}