const Transactions = require("../Models/Transactions");
const moment = require("moment");
const Products = require("../Models/Products");
const MoneyTransactions = require("../Models/MoneyTransactions");
const _ = require("lodash");

exports.addEnter = async (req, res) => {
  if (_.isNumber(req.body.buyPrice) && req.body.buyPrice > 0) {
    const now = moment();
    const toInsert = {
      idUser: req.user.idUser,
      idProduct: req.product.idProduct,
      nameOfProduct: req.product.name,
      nameOfUser: req.user.name,
      stockAfter: Number(req.product.inStock) + Number(req.body.quantity),
      enter: req.body.quantity,
      outlet: 0,
      description: req.body.description,
      timestamp: now.unix(),
    };

    let idCategory = null;

    if (req.product.type === "Spiritueux") {
      idCategory = 11;
    } else if (req.product.type === "Boissons") {
      idCategory = 2;
    } else if (req.product.type === "Plâts") {
      idCategory = 13;
    } else {
      idCategory = 12;
    }

    await Transactions.insertOne(toInsert)
      .then(async () => {
        const lastTransactionMethod = await MoneyTransactions.customQuery(
          "SELECT * FROM methods WHERE idMethod = 1"
        );
        const lastTransaction = await MoneyTransactions.findLast();
        if (
          Number(lastTransactionMethod[0].amount) -
            Number(req.body.buyPrice) * Number(req.body.quantity) <
          0
        ) {
          return res.status(400).json({ negativeAmount: true });
        }
        MoneyTransactions.insertOne({
          idCategory: idCategory,
          idMethod: 1,
          enter: 0,
          outlet: Number(req.body.buyPrice) * Number(req.body.quantity),
          amountAfterMethod:
            Number(lastTransactionMethod[0].amount) -
            Number(req.body.buyPrice) * Number(req.body.quantity),
          amountAfter:
            Number(lastTransaction[0].amountAfter) -
            Number(req.body.buyPrice) * Number(req.body.quantity),
          timestamp: now.unix(),
          description: `Approvisionnement produit ${req.product.name}`,
        })
          .then(async () => {
            await Products.updateOne(
              { inStock: toInsert.stockAfter },
              toInsert.idProduct
            ).then(async () => {
              const last = await MoneyTransactions.customQuery(
                "SELECT amount FROM methods WHERE idMethod = 1",
                []
              );
              await MoneyTransactions.customQuery(
                "UPDATE methods SET amount = ? WHERE idMethod = ?",
                [
                  last[0].amount +
                    Number(req.body.buyPrice) * Number(req.body.quantity),
                  1,
                ]
              );
              res.status(201).json({ create: true });
            });
          })
          .catch((error) => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  } else {
    res.status(400).json({ invalidForm: true });
  }
};

exports.addOutlet = async (req, res) => {
  const now = moment();
  const toInsert = {
    idUser: req.user.idUser,
    idProduct: req.product.idProduct,
    nameOfProduct: req.product.name,
    nameOfUser: req.user.name,
    stockAfter: Number(req.product.inStock) - Number(req.body.quantity),
    enter: 0,
    outlet: req.body.quantity,
    description: req.body.description,
    timestamp: now.unix(),
  };
  if (toInsert.stockAfter < 0) {
    res.status(400).json({ negativeStock: true });
  } else {
    await Transactions.insertOne(toInsert)
      .then(async () => {
        await Products.updateOne(
          { inStock: toInsert.stockAfter },
          toInsert.idProduct
        )
          .then(() => {
            res.status(201).json({ create: true });
          })
          .catch((error) => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  }
};

exports.getAllTransaction = (req, res) => {
  Transactions.findAll()
    .then((transaction) => {
      res.status(200).json({ find: true, result: transaction });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getOfOneDay = async (req, res) => {
  await Transactions.findOfProductFromOneDay(
    req.params.idProduct,
    req.params.timestampBegin
  )
    .then(async (transactions) => {
      await Transactions.findBeginOfProductFromOneDay(
        req.params.idProduct,
        req.params.timestampBegin
      )
        .then(async (begin) => {
          await Transactions.findEndOfProductFromOneDay(
            req.params.idProduct,
            req.params.timestampBegin
          )
            .then((end) => {
              console.log("Begin", begin[0]);
              console.log("End", end[0]);
              console.log("Transaction", transactions[0]);
              res.status(200).json({
                find: true,
                result: { ...transactions[0], begin: begin[0], end: end[0] },
              });
            })
            .catch((error) => {
              res.status(500).json({ error: true, errorMessage: error });
            });
        })
        .catch((error) => {
          res.status(500).json({ error: true, errorMessage: error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getAllTransactionOfOneProduct = (req, res) => {
  Transactions.find({ idProduct: req.params.idProduct })
    .then((transaction) => {
      res.status(200).json({ find: true, result: transaction });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getReport = async (req, res) => {
  try {
    const products = await Products.findAll();
    let response = [];
    for (let index in products) {
      const info = await Transactions.findOfOneProductWithTimestamp(
        products[index].idProduct,
        req.params.begin,
        req.params.end
      );
      const stock = await Transactions.findStockOfOneProductWithTimestamp(
        products[index].idProduct,
        req.params.begin,
        req.params.end
      );

      if (stock.length > 0 && info.length > 0) {
        response.push({ ...info[0], stock: stock[0].stockAfter });
      } else {
        continue;
      }
    }
    res.status(200).json({ find: true, result: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, errorMessage: err });
  }
};
