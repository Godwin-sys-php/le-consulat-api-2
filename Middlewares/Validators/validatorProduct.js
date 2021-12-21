const _ = require('lodash');
const Products = require('../../Models/Products');

module.exports = (req, res, next) => {
  try {
    let condition = ((req.body.name.length >= 2 && req.body.name.length <= 70) && (req.body.type === 'Spiritueux' || req.body.type === 'Boissons' || req.body.type === 'Plâts' || req.body.type === 'Cigarettes') && (_.isNumber(req.body.price)) && (_.isNumber(req.body.inStock)) && (req.body.unit.length >= 2 && req.body.unit.length <= 70));

    let condition2 = ((req.body.name.length >= 2 && req.body.name.length <= 70) && (req.body.type === 'Spiritueux' || req.body.type === 'Boissons' || req.body.type === 'Plâts' || req.body.type === 'Cigarettes') && (_.isNumber(req.body.price)) && (req.body.unit.length >= 2 && req.body.unit.length <= 70));
    
    if (req.method === 'PUT') {
      if (condition2) {
        Products.findOneWithoutAnID({ name: req.body.name }, req.params.idProduct)
          .then(product => {
            product.length < 1 ? next() : res.status(400).json({ existName: true });
          })
          .catch(() => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      } else {
        res.status(400).json({ invalidForm: true });
      }
    } else {
      if (condition) {
        Products.findOne({ name: req.body.name })
          .then(product => {
            product.length < 1 ? next() : res.status(400).json({ existName: true });
          })
          .catch(() => {
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