const Products = require('../Models/Products');

exports.addOneProduct = (req, res) => {
  const toInsert = {
    name: req.body.name,
    price: req.body.price,
    type: req.body.type,
    unit: req.body.unit,
    inStock: req.body.inStock,
  };

  Products.insertOne(toInsert)
    .then(() => {
      res.status(201).json({ create: true });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.updateOneProduct = (req, res) => {
  const toSet = {
    name: req.body.name,
    price: req.body.price,
    unit: req.body.unit,
    type: req.body.type,
    buyPrice: Number(req.body.buyPrice),
  };

  Products.updateOne(toSet, req.params.idProduct)
    .then(() => {
      res.status(200).json({ update: true });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getOneProduct = (req, res) => {
  Products.findOne({ idProduct: req.params.idProduct })
    .then(product => {
      res.status(200).json({ find: true, result: product[0] });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getAllProduct = (req, res) => {
  Products.findAll()
    .then(product => {
      res.status(200).json({ find: true, result: product });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.deleteOneProduct = (req, res) => {
  Products.deleteOne(req.params.idProduct)
    .then(() => {
      res.status(200).json({ delete: true });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getMostPopularType = async (req, res) => {
  try {
    const types = await Products.findMostPopularType();
    return res.status(200).json({ find: true, result: types });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
}

exports.getMostPopularProducts = async (req, res) => {
  try {
    const drinks = await Products.findMostPopularProducts("Boissons");
    const spirits = await Products.findMostPopularProducts("Spiritueux");
    const dishes = await Products.findMostPopularProducts("Plâts");
    const cigarettes = await Products.findMostPopularProducts("Cigarettes");

    return res.status(200).json({ find: true, result: { drinks: drinks, spirits: spirits, dishes: dishes, cigarettes: cigarettes } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
}
