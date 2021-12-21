const _ = require('lodash');
const Products = require('../../Models/Products');

module.exports = (req, res, next) => {
  if (_.isNumber(req.body.quantity)) {
    Products.findOne({ idProduct: req.body.idProduct })
      .then(product => {
        req.product = product[0];
        product.length < 1 ? res.status(400).json({ productNotFound: true }) : next(); 
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  } else {
    res.status(200).json({ invalidForm: true });
  }
};