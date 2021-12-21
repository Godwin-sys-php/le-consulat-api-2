const Products = require('../../Models/Products');

module.exports = (req, res, next) => {
  Products.findOne({ idProduct: req.params.idProduct })
    .then((product) => {
      req.product = product[0];
      product.length < 1 ? res.status(400).json({ productNotFound: true }) : next();
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};