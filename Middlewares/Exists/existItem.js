const Products = require('../../Models/Products');
const Sessions = require('../../Models/Sessions');

module.exports = (req, res, next) => {
  Sessions.findItem({ idSessionsItem: req.params.idItem })
    .then((item) => {
      if (item.length > 0) {
        Products.findOne({ idProduct: item[0].idProduct })
          .then((product) => {
            req.item = { ...item[0], inStock: product[0].inStock };
            next();
          })
          .catch((error) => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      } else {
        res.status(400).json({ itemNotFound: true });
      }
    })
};