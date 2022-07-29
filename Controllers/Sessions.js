const Sessions = require("../Models/Sessions");
const moment = require("moment");
const Transactions = require("../Models/Transactions");
const MoneyTransactions = require("../Models/MoneyTransactions");
const _ = require("lodash");
const Products = require("../Models/Products");
const Clients = require("../Models/Clients");
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

exports.startNewSession = (req, res) => {
  console.log(req.body);
  const now = moment();
  if (req.body.idClient) {
    Clients.findOne({ idClient: req.body.idClient })
      .then((clients) => {
        if (clients.length < 1) {
          res.status(400).json({ clientNotFound: true });
        } else {
          let toInsert = {
            idUser: req.user.idUser,
            nameOfUser: req.user.name,
            timestamp: now.unix(),
            wasOver: 0,
            total: 0,
            beenPaid: 0,
            idClient: req.body.idClient,
            nameOfClient: clients[0].name,
            nameOfServer: req.body.nameOfServer,
          };

          Sessions.insertOne(toInsert)
            .then((result) => {
              req.app
                .get("socketService")
                .broadcastEmiter(result.insertId, "new-session");
              return res
                .status(201)
                .json({ create: true, idInserted: result.insertId });
            })
            .catch((error) => {
              res.status(500).json({ error: true, errorMessage: error });
            });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  } else {
    let toInsert = {
      idUser: req.notUseToken ? 0 : req.user.idUser,
      nameOfUser: req.notUseToken ? "Tech'Eat Fast" : req.user.name,
      timestamp: now.unix(),
      wasOver: 0,
      total: 0,
      nameOfClient: req.notUseToken ? req.body.nameOfClient : "",
      beenPaid: 0,
      nameOfServer: req.body.nameOfServer,
    };
    console.log(toInsert);
    Sessions.insertOne(toInsert)
      .then((result) => {
        req.app
          .get("socketService")
          .broadcastEmiter(result.insertId, "new-session");
        return res
          .status(201)
          .json({ create: true, idInserted: result.insertId });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: true, errorMessage: error });
      });
  }
};

exports.updateSession = (req, res) => {
  if (req.body.idClient) {
    Clients.findOne({ idClient: req.body.idClient }).then((clients) => {
      if (clients.length < 1) {
        res.status(400).json({ clientNotFound: true });
      } else {
        Sessions.updateOne(
          {
            idClient: req.body.idClient,
            nameOfClient: clients[0].name,
            nameOfServer: req.body.nameOfServer,
          },
          req.params.idSession
        )
          .then(() => {
            req.app
              .get("socketService")
              .broadcastEmiter(req.params.idSession, "edit-session");
            res.status(200).json({ update: true });
          })
          .catch((error) => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      }
    });
  } else {
    res.status(200).json({ update: true });
  }
};

exports.addItemToSession = (req, res) => {
  const now = moment();
  const toInsert = {
    idSession: req.params.idSession,
    idProduct: req.body.idProduct,
    nameOfProduct: req.product.name,
    quantity: req.body.quantity,
    price:
      req.session.idUser == 0
        ? req.product.price - req.product.price * 0.1
        : req.product.price,
    taken: 0,
  };
  const toInsert2 = _.isNull(req.session.idClient)
    ? {
        idUser: req.notUseToken ? 0 : req.session.idUser,
        idProduct: req.body.idProduct,
        nameOfProduct: req.product.name,
        nameOfUser: req.notUseToken ? "Tech'Eat Fast" : req.user.name,
        stockAfter: req.product.inStock - req.body.quantity,
        enter: 0,
        outlet: req.body.quantity,
        description: "Commande d'un client",
        timestamp: now.unix(),
      }
    : {
        idClient: req.session.idClient,
        idUser: req.notUseToken ? 0 : req.session.idUser,
        idProduct: req.body.idProduct,
        nameOfProduct: req.product.name,
        nameOfUser: req.notUseToken ? "Tech'Eat Fast" : req.user.name,
        stockAfter: req.product.inStock - req.body.quantity,
        enter: 0,
        outlet: req.body.quantity,
        description: "Commande d'un client",
        timestamp: now.unix(),
      };

  if (toInsert2.stockAfter < 0) {
    res.status(400).json({ negativeStock: true });
  } else {
    const promises = [
      Sessions.insertItem(toInsert),
      Transactions.insertOne(toInsert2),
      Sessions.updateOne(
        { total: req.session.total + req.body.quantity * toInsert.price },
        req.params.idSession
      ),
      Products.updateOne(
        { inStock: toInsert2.stockAfter },
        toInsert2.idProduct
      ),
    ];

    Promise.all(promises)
      .then(() => {
        req.app
          .get("socketService")
          .broadcastEmiter(req.params.idSession, "edit-session");
        res.status(201).json({ create: true });
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  }
};

exports.updateItemOfSession = (req, res) => {
  const now = moment();

  const idProduct = req.item.idProduct; // Ancien
  const idProductNew = req.product.idProduct; // Nouveau

  if (idProduct == idProductNew) {
    const toSetTransaction = {
      idClient: req.session.idClient,
      idUser: req.user.idUser,
      idProduct: idProduct,
      nameOfProduct: req.item.nameOfProduct,
      nameOfUser: req.user.name,
      stockAfter: req.item.inStock + req.item.quantity - req.body.quantity,
      enter: req.item.quantity,
      outlet: req.body.quantity,
      description: "Modification commande d'un client",
      timestamp: now.unix(),
    };
    const toSetProduct = {
      inStock: toSetTransaction.stockAfter,
    };

    const toSetItem = {
      idProduct: idProduct,
      nameOfProduct: req.product.name,
      quantity: req.body.quantity,
      price:
        req.session.idUser == 0
          ? req.product.price - req.product.price * 0.1
          : req.product.price,
    };

    const toSetSession = {
      total:
        req.session.total -
        req.item.price * req.item.quantity +
        toSetItem.price * req.body.quantity,
    };

    if (toSetTransaction.stockAfter < 0) {
      res.status(400).json({ negativeStock: true });
    } else {
      const promises = [
        Transactions.insertOne(toSetTransaction),
        Products.updateOne(toSetProduct, idProduct),
        Sessions.updateItem(toSetItem, { idSessionsItem: req.params.idItem }),
        Sessions.updateOne(toSetSession, req.params.idSession),
      ];

      Promise.all(promises)
        .then(() => {
          req.app
            .get("socketService")
            .broadcastEmiter(req.params.idSession, "edit-session");
          res.status(200).json({ update: true });
        })
        .catch((error) => {
          res.status(500).json({ error: true, errorMessage: error });
        });
    }
  } else {
    const toSetTransaction = {
      idClient: req.session.idClient,
      idUser: req.user.idUser,
      idProduct: idProduct,
      nameOfProduct: req.item.nameOfProduct,
      nameOfUser: req.user.name,
      stockAfter: req.item.inStock + req.item.quantity,
      enter: req.item.quantity,
      outlet: 0,
      description: "Modification commande d'un client",
      timestamp: now.unix(),
    };
    const toSetProduct = {
      inStock: toSetTransaction.stockAfter,
    };

    const toSetTransaction2 = {
      idClient: req.session.idClient,
      idUser: req.user.idUser,
      idProduct: idProductNew,
      nameOfProduct: req.product.name,
      nameOfUser: req.user.name,
      stockAfter: req.product.inStock - req.body.quantity,
      enter: 0,
      outlet: req.body.quantity,
      description: "Modification commande d'un client",
      timestamp: now.unix(),
    };
    const toSetProduct2 = {
      inStock: toSetTransaction2.stockAfter,
    };

    const toSetItem = {
      idProduct: idProductNew,
      nameOfProduct: req.product.name,
      quantity: req.body.quantity,
      price:
        req.session.idUser == 0
          ? req.product.price - req.product.price * 0.1
          : req.product.price,
    };

    const toSetSession = {
      total:
        req.session.total -
        req.item.price * req.item.quantity +
        toSetItem.price * req.body.quantity,
    };

    if (toSetTransaction2.stockAfter < 0) {
      res.status(400).json({ negativeStock: true });
    } else {
      const promises = [
        Transactions.insertOne(toSetTransaction),
        Products.updateOne(toSetProduct, idProduct),
        Transactions.insertOne(toSetTransaction2),
        Products.updateOne(toSetProduct2, idProductNew),
        Sessions.updateItem(toSetItem, { idSessionsItem: req.params.idItem }),
        Sessions.updateOne(toSetSession, req.params.idSession),
      ];

      Promise.all(promises)
        .then(() => {
          req.app
            .get("socketService")
            .broadcastEmiter(req.params.idSession, "edit-session");
          res.status(200).json({ update: true });
        })
        .catch((error) => {
          res.status(500).json({ error: true, errorMessage: error });
        });
    }
  }
};

exports.addAccompanimentToSessionItem = (req, res) => {
  const now = moment();
  const toInsert = {
    idSessionItem: req.params.idItem,
    idProduct: req.body.idProduct,
    quantity: req.body.quantity,
  };

  const toInsert2 = _.isNull(req.session.idClient)
    ? {
        idUser: req.session.idUser,
        idProduct: req.body.idProduct,
        nameOfProduct: req.product.name,
        nameOfUser: req.user.name,
        stockAfter: req.product.inStock - req.body.quantity,
        enter: 0,
        outlet: req.body.quantity,
        description: "Accompagnement de la commande d'un client",
        timestamp: now.unix(),
      }
    : {
        idClient: req.session.idClient,
        idUser: req.session.idUser,
        idProduct: req.body.idProduct,
        nameOfProduct: req.product.name,
        nameOfUser: req.user.name,
        stockAfter: req.product.inStock - req.body.quantity,
        enter: 0,
        outlet: req.body.quantity,
        description: "Accompagnement de la commande d'un client",
        timestamp: now.unix(),
      };

  if (toInsert2.stockAfter < 0) {
    res.status(400).json({ negativeStock: true });
  } else {
    const promises = [
      Sessions.insertAccompaniment(toInsert),
      Transactions.insertOne(toInsert2),
      Products.updateOne(
        { inStock: toInsert2.stockAfter },
        toInsert2.idProduct
      ),
    ];

    Promise.all(promises)
      .then(() => {
        req.app
          .get("socketService")
          .broadcastEmiter(req.params.idSession, "edit-session");
        res.status(200).json({ create: true });
      })
      .catch((error) => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  }
};

exports.getDebtSumPerClient = async (req, res) => {
  try {
    const debt = await MoneyTransactions.customQuery(
      "SELECT SUM((total-reduction) - amountPaid) as debt, nameOfClient FROM sessions WHERE idMethod = 4 OR (amountPaid < total - reduction) GROUP BY nameOfClient"
    );
    return res.status(200).json({ find: true, result: debt });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
}

exports.getDebtsOfOneClient = async (req, res) => {
  try {
    console.log("sdf");
    const sumOfDebt = await MoneyTransactions.customQuery(
      "SELECT SUM((total-reduction) - amountPaid) as debt FROM sessions WHERE (idMethod = 4 OR (amountPaid < total - reduction)) AND nameOfClient = ?", [req.params.nameOfClient]
    );
    const sessions = await MoneyTransactions.customQuery(
      "SELECT * FROM sessions WHERE (idMethod = 4 OR (amountPaid < total - reduction)) AND nameOfClient = ?", [req.params.nameOfClient]
    );
    const paymentHistory = await Sessions.customQuery("SELECT amountPaid, timestamp, idSession FROM payedDebt WHERE nameOfClient = ?", [req.params.nameOfClient]);
    return res.status(200).json({ find: true, sumOfDebt: sumOfDebt[0].debt, sessions: sessions, paymentHistory: paymentHistory, });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
}

exports.editMoneyOfSession = async (req, res) => {
  const now = moment();
  const lastTransaction = await MoneyTransactions.findLast();
  if (
    (req.body.paymentMethod == 1 ||
      req.body.paymentMethod == 2 ||
      req.body.paymentMethod == 3 ||
      req.body.paymentMethod == 4 ||
      req.body.paymentMethod == 5 ||
      req.body.paymentMethod == 6) &&
    _.isNumber(req.body.amountPaid) &&
    req.body.amountPaid <= req.session.total
  ) {
    await Sessions.updateOne(
      { idMethod: req.body.paymentMethod, amountPaid: req.body.amountPaid },
      req.params.idSession
    );
    if (req.session.idMethod !== req.body.paymentMethod) {
      const last = await MoneyTransactions.customQuery(
        "SELECT * FROM methods WHERE idMethod = ?",
        [req.session.idMethod]
      );
      const last2 = await MoneyTransactions.customQuery(
        "SELECT * FROM methods WHERE idMethod = ?",
        [req.body.paymentMethod]
      );
      await MoneyTransactions.customQuery(
        "UPDATE methods SET amount = ? WHERE idMethod = ?",
        [last[0].amount - req.session.amountPaid, req.session.idMethod]
      );
      await MoneyTransactions.customQuery(
        "UPDATE methods SET amount = ? WHERE idMethod = ?",
        [last2[0].amount + req.session.amountPaid, req.body.paymentMethod]
      );
    } else {
      const last = await MoneyTransactions.customQuery(
        "SELECT * FROM methods WHERE idMethod = ?",
        [req.body.paymentMethod]
      );
      await MoneyTransactions.customQuery(
        "UPDATE methods SET amount = ? WHERE idMethod = ?",
        [
          last[0].amount - req.session.amountPaid + req.body.amountPaid,
          req.session.idMethod,
        ]
      );
    }
    const result = await MoneyTransactions.insertOne({
      idCategory: 1,
      idMethod: req.body.paymentMethod,
      idUser: req.user.idUser,
      enter: req.body.amountPaid,
      outlet: req.session.amountPaid,
      amountAfter:
        lastTransaction[0].amountAfter -
        req.session.amountPaid +
        req.body.amountPaid,
      timestamp: now.unix(),
      description: `Changement de paramètre de paiement`,
    });
    if (
      req.body.amountPaid !== req.session.amountPaid &&
      req.body.amountPaid > req.session.amountPaid
    ) {
      const toInsert = {
        idUser: req.user.idUser,
        idClient: req.session.idClient,
        idSession: req.params.idSession,
        idTransaction: result.insertId,
        idMethod: req.body.paymentMethod,
        nameOfClient: req.session.nameOfClient,
        amountPaid: req.body.amountPaid - req.session.amountPaid,
        timestamp: now.unix(),
      };
      await MoneyTransactions.customQuery("INSERT INTO payedDebt SET ?", [
        toInsert,
      ]);
    }
    req.app
      .get("socketService")
      .broadcastEmiter(req.params.idSession, "edit-session");
    return res.status(200).json({ update: true });
  } else {
    return res.status(400).json({ invalidForm: true });
  }
};

exports.finishAndPay = (req, res, next) => {
  if (
    (req.body.paymentMethod == 1 ||
      req.body.paymentMethod == 2 ||
      req.body.paymentMethod == 3 ||
      req.body.paymentMethod == 4 ||
      req.body.paymentMethod == 5 ||
      req.body.paymentMethod == 6) &&
    _.isNumber(req.body.amountPaid) &&
    req.body.amountPaid <= req.session.total
  ) {
    const now = moment();
    Sessions.updateOne(
      {
        beenPaid: 1,
        idMethod: req.body.paymentMethod,
        wasOver: 1,
        amountPaid: req.body.amountPaid,
      },
      req.params.idSession
    )
      .then(async () => {
        await MoneyTransactions.findLast()
          .then(async (lastTransaction) => {
            await MoneyTransactions.insertOne({
              idCategory: 1,
              idMethod: req.body.paymentMethod,
              idUser: req.user.idUser,
              enter: req.body.amountPaid,
              outlet: 0,
              amountAfter: lastTransaction[0].amountAfter + req.body.amountPaid,
              timestamp: now.unix(),
              description: `Paiement facture`,
            })
              .then(async () => {
                const last = await MoneyTransactions.customQuery(
                  "SELECT * FROM methods WHERE idMethod = ?",
                  [req.body.paymentMethod]
                );
                await MoneyTransactions.customQuery(
                  "UPDATE methods SET amount = ? WHERE idMethod = ?",
                  [last[0].amount + req.body.amountPaid, req.body.paymentMethod]
                );
                next();
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({ error: true, errorMessage: error });
              });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ error: true, errorMessage: error });
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: true, errorMessage: error });
      });
  } else {
    return res.status(400).json({ invalidForm: true });
  }
};

exports.finish = (req, res, next) => {
  Sessions.updateOne({ wasOver: 1 }, req.params.idSession)
    .then(() => {
      next();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.pay = (req, res) => {
  const now = moment();
  if (
    (req.body.paymentMethod == 1 ||
      req.body.paymentMethod == 2 ||
      req.body.paymentMethod == 3 ||
      req.body.paymentMethod == 4 ||
      req.body.paymentMethod == 5 ||
      req.body.paymentMethod == 6) &&
    _.isNumber(req.body.amountPaid) &&
    req.body.amountPaid <= req.session.total
  ) {
    Sessions.updateOne(
      {
        beenPaid: 1,
        idMethod: req.body.paymentMethod,
        amountPaid: req.body.amountPaid,
      },
      req.params.idSession
    )
      .then(async () => {
        await MoneyTransactions.findLast()
          .then(async (lastTransaction) => {
            await MoneyTransactions.insertOne({
              idCategory: 1,
              idMethod: req.body.paymentMethod,
              idUser: req.user.idUser,
              enter: req.body.amountPaid,
              outlet: 0,
              amountAfter: lastTransaction[0].amountAfter + req.body.amountPaid,
              timestamp: now.unix(),
              description: `Paiement facture`,
            })
              .then(async () => {
                const last = await MoneyTransactions.customQuery(
                  "SELECT * FROM methods WHERE idMethod = ?",
                  [req.body.paymentMethod]
                );
                await MoneyTransactions.customQuery(
                  "UPDATE methods SET amount = ? WHERE idMethod = ?",
                  [last[0].amount + req.body.amountPaid, req.body.paymentMethod]
                );
                req.app
                  .get("socketService")
                  .broadcastEmiter(req.params.idSession, "edit-session");
                res.status(200).json({ update: true });
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({ error: true, errorMessage: error });
              });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ error: true, errorMessage: error });
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: true, errorMessage: error });
      });
  } else {
    return res.status(400).json({ invalidForm: true });
  }
};

exports.addReduction = (req, res) => {
  Sessions.updateOne({ reduction: req.body.reduction }, req.params.idSession)
    .then(() => {
      req.app
        .get("socketService")
        .broadcastEmiter(req.params.idSession, "edit-session");
      res.status(200).json({ update: true });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.reductionToZero = (req, res) => {
  Sessions.updateOne({ reduction: 0 }, req.params.idSession)
    .then(() => {
      req.app
        .get("socketService")
        .broadcastEmiter(req.params.idSession, "edit-session");
      res.status(200).json({ update: true });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getMethods = async (req, res) => {
  const methods = await Sessions.findMethods();
  return res.status(200).json({ find: true, result: methods });
};

exports.getAllSession = (req, res) => {
  Sessions.findAll()
    .then((sessions) => {
      res.status(200).json({ find: true, result: sessions });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getOneSession = (req, res) => {
  Sessions.find({ idSession: req.params.idSession })
    .then(async (sessions) => {
      const items = await Sessions.findItem({
        idSession: req.params.idSession,
      });
      let paymentHistory = [];
      const products2 = await Products.findAll();
      let products = [];
      const methods = await Sessions.findMethods();
      for (let index in products2) {
        products.push({ ...products2[index], id: products2[index].idProduct });
      }
      if (sessions[0].beenPaid) {
        paymentHistory = await Sessions.customQuery("SELECT amountPaid, timestamp FROM payedDebt WHERE idSession = ?", [req.params.idSession]);

      }
      res.status(200).json({
        find: true,
        result: sessions,
        items: items,
        products: products,
        methods: methods,
        paymentHistory: paymentHistory,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getItemOfSession = (req, res) => {
  Sessions.findItem({ idSession: req.params.idSession })
    .then((item) => {
      res.status(200).json({ find: true, result: item });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getNotFinished = (req, res) => {
  Sessions.find({ beenPaid: 0 })
    .then(async (sessions) => {
      const tef = await fetch("https://api.techeatfast.com/commands/restaurant/2/not-done", {
        method: "GET",
        headers: {
          'Authorization': 'Bearer token-special-le-consulat', 
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(res => res.json());
      res.status(200).json({ find: true, result: sessions, tef: tef.result, });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getNotFinishedAsWaiter = (req, res) => {
  Sessions.customQuery(
    "SELECT * FROM sessions WHERE beenPaid = 0 AND nameOfServer = ?",
    [req.user.pseudo.toUpperCase()]
  )
    .then(async (sessions) => {
      const clients = await Clients.findAll();
      res.status(200).json({ find: true, result: sessions, clients: clients });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getDebt = async (req, res) => {
  const debt = await MoneyTransactions.customQuery(
    "SELECT * FROM sessions WHERE idMethod = 4 OR (amountPaid < total - reduction) ORDER BY idSession DESC"
  );

  return res.status(200).json({ find: true, result: debt });
};

exports.getNotPaied = (req, res) => {
  Sessions.getNotPaid()
    .then((sessions) => {
      res.status(200).json({ find: true, result: sessions });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getFinished = (req, res) => {
  Sessions.find({ wasOver: 1 })
    .then((sessions) => {
      res.status(200).json({ find: true, result: sessions });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getAccompanimentOfItem = (req, res) => {
  Sessions.findAccompaniment(req.params.idItem)
    .then((accomp) => {
      res.status(200).json({ find: true, result: accomp });
    })
    .catch((error) => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.deleteOneSession = async (req, res) => {
  const now = moment();
  const toSetTransaction = {
    idClient: req.session.idClient,
    idUser: req.user.idUser,
    nameOfUser: req.user.name,
    outlet: 0,
    description: "Suppression de la commande d'un client",
    timestamp: now.unix(),
  };

  const items = await Sessions.findItem({ idSession: req.session.idSession });

  for (let index in items) {
    try {
      const accompaniments = await Sessions.findAccompaniment(
        items[index].idSessionsItem
      );
      console.log(accompaniments);
      if (accompaniments.length > 0) {
        for (let index in accompaniments) {
          await Transactions.insertOne({
            ...toSetTransaction,
            idProduct: accompaniments[index].idProduct,
            nameOfProduct: accompaniments[index].nameOfProduct,
            enter: accompaniments[index].quantity,
            stockAfter:
              accompaniments[index].inStock + accompaniments[index].quantity,
          });
          await Products.updateOne(
            {
              inStock:
                accompaniments[index].inStock + accompaniments[index].quantity,
            },
            accompaniments[index].idProduct
          );
        }
        await Sessions.deleteAccompAndItem(req.params.idItem);
        const product = await Products.findOne({
          idProduct: items[index].idProduct,
        });
        await Products.updateOne(
          { inStock: product[0].inStock + items[index].quantity },
          req.item.idProduct
        );
        await Sessions.updateOne(
          {
            total:
              req.session.total - items[index].quantity * items[index].price,
          },
          req.params.idSession
        );
        await Sessions.deleteOneItem(req.params.idItem);
        await Transactions.insertOne({
          ...toSetTransaction,
          stockAfter: product[0].inStock + items[index].quantity,
          idProduct: items[index].idProduct,
          nameOfProduct: items[index].nameOfProduct,
          enter: items[index].quantity,
        });

        req.app
          .get("socketService")
          .broadcastEmiter(req.params.idSession, "edit-session");
        return res.status(200).json({ delete: true });
      } else {
        await Sessions.deleteAccompAndItem(items[index].idSessionsItem);
        const product = await Products.findOne({
          idProduct: items[index].idProduct,
        });
        await Products.updateOne(
          { inStock: product[0].inStock + items[index].quantity },
          items[index].idProduct
        );
        await Sessions.updateOne(
          {
            total:
              req.session.total - items[index].quantity * items[index].price,
          },
          req.params.idSession
        );
        await Sessions.deleteOneItem(items[index].idSessionsItem);
        await Transactions.insertOne({
          ...toSetTransaction,
          stockAfter: product[0].inStock + items[index].quantity,
          idProduct: items[index].idProduct,
          nameOfProduct: items[index].nameOfProduct,
          enter: items[index].quantity,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: true });
    }
  }

  await Sessions.deleteOne(req.params.idSession);

  req.app
    .get("socketService")
    .broadcastEmiter(req.params.idSession, "edit-session");
  return res.status(200).json({ delete: true });
};

exports.deleteOneItem = async (req, res) => {
  console.log("Hello");
  console.log("Hello");
  console.log("Hello");
  const now = moment();
  const toSetTransaction = {
    idClient: req.session.idClient,
    idUser: req.user.idUser,
    nameOfUser: req.user.name,
    outlet: 0,
    description: "Suppression élément de la commande d'un client",
    timestamp: now.unix(),
  };

  try {
    const accompaniments = await Sessions.findAccompaniment(req.params.idItem);
    console.log(accompaniments);
    if (accompaniments.length > 0) {
      for (let index in accompaniments) {
        await Transactions.insertOne({
          ...toSetTransaction,
          idProduct: accompaniments[index].idProduct,
          nameOfProduct: accompaniments[index].nameOfProduct,
          enter: accompaniments[index].quantity,
          stockAfter:
            accompaniments[index].inStock + accompaniments[index].quantity,
        });
        await Products.updateOne(
          {
            inStock:
              accompaniments[index].inStock + accompaniments[index].quantity,
          },
          accompaniments[index].idProduct
        );
      }
      await Sessions.deleteAccompAndItem(req.params.idItem);
      const product = await Products.findOne({ idProduct: req.item.idProduct });
      await Products.updateOne(
        { inStock: product[0].inStock + req.item.quantity },
        req.item.idProduct
      );
      await Sessions.updateOne(
        { total: req.session.total - req.item.quantity * req.item.price },
        req.params.idSession
      );
      await Sessions.deleteOneItem(req.params.idItem);
      await Transactions.insertOne({
        ...toSetTransaction,
        stockAfter: product[0].inStock + req.item.quantity,
        idProduct: req.item,
        idProduct,
        nameOfProduct: req.item.nameOfProduct,
        enter: req.item.quantity,
      });

      req.app
        .get("socketService")
        .broadcastEmiter(req.params.idSession, "edit-session");
      return res.status(200).json({ delete: true });
    } else {
      await Sessions.deleteAccompAndItem(req.params.idItem);
      const product = await Products.findOne({ idProduct: req.item.idProduct });
      await Products.updateOne(
        { inStock: product[0].inStock + req.item.quantity },
        req.item.idProduct
      );
      await Sessions.updateOne(
        { total: req.session.total - req.item.quantity * req.item.price },
        req.params.idSession
      );
      await Sessions.deleteOneItem(req.params.idItem);
      await Transactions.insertOne({
        ...toSetTransaction,
        stockAfter: product[0].inStock + req.item.quantity,
        idProduct: req.item.idProduct,
        nameOfProduct: req.item.nameOfProduct,
        enter: req.item.quantity,
      });

      req.app
        .get("socketService")
        .broadcastEmiter(req.params.idSession, "edit-session");
      return res.status(200).json({ delete: true });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
};

exports.getReport = async (req, res) => {
  try {
    const recipe = await Sessions.findRecipeOfDay(req.params.timestamp);
    const sessions = await Sessions.findSessionsOfDay(req.params.timestamp);
    const products = await Sessions.findProductsSellOfDay(req.params.timestamp);
    const expenses = await MoneyTransactions.findExpenses(req.params.timestamp);
    const expensesTransactions =
      await MoneyTransactions.findExpensesTransaction(req.params.timestamp);
    const allRecipe = await MoneyTransactions.findRecipe(req.params.timestamp);
    const debtPM = await MoneyTransactions.customQuery(
      "SELECT SUM(amountPaid) as debt FROM sessions WHERE idMethod = 4 AND timestamp >= ? AND timestamp < ?",
      [Number(req.params.timestamp), Number(req.params.timestamp) + 86400]
    );
    const debt = await MoneyTransactions.customQuery(
      "SELECT SUM((total-reduction) - amountPaid) as debt FROM sessions WHERE (amountPaid < total - reduction) AND timestamp >= ? AND timestamp < ? AND idMethod != 4",
      [Number(req.params.timestamp), Number(req.params.timestamp) + 86400]
    );
    const sumPayedDebt = await MoneyTransactions.customQuery(
      "SELECT SUM(amountPaid) as payedDebt FROM payedDebt WHERE timestamp >= ? AND timestamp < ?",
      [Number(req.params.timestamp), Number(req.params.timestamp) + 86400]
    );
    const cash = await MoneyTransactions.customQuery(
      "SELECT SUM(amountPaid) as money FROM sessions WHERE timestamp >= ? AND timestamp < ? AND idMethod = 1",
      [Number(req.params.timestamp), Number(req.params.timestamp) + 86400]
    );
    const mpesa = await MoneyTransactions.customQuery(
      "SELECT SUM(amountPaid) as money FROM sessions WHERE timestamp >= ? AND timestamp < ? AND idMethod = 2",
      [Number(req.params.timestamp), Number(req.params.timestamp) + 86400]
    );
    const cb = await MoneyTransactions.customQuery(
      "SELECT SUM(amountPaid) as money FROM sessions WHERE timestamp >= ? AND timestamp < ? AND idMethod = 3",
      [Number(req.params.timestamp), Number(req.params.timestamp) + 86400]
    );
    const server = await Sessions.findServerOfADay(req.params.timestamp);

    console.log(cash[0].money);
    res.status(200).json({
      find: true,
      recipe: recipe[0].recipe + sumPayedDebt[0].payedDebt,
      cash: cash[0].money,
      mpesa: mpesa[0].money,
      cb: cb[0].money,
      sessions: sessions,
      productsSell: products,
      expenses: expenses[0].expenses,
      allRecipe: allRecipe[0].recipe,
      expensesTransactions: expensesTransactions,
      server: server,
      debt: debt[0].debt + debtPM[0].debt,
      sumPayedDebt: sumPayedDebt[0].payedDebt,
    });
  } catch (error) {
    res.status(500).json({ error: true, errorMessage: error });
  }
};

exports.getReportPeriod = async (req, res) => {
  try {
    const recipe = await Sessions.findRecipeOfPeriod(
      req.params.begin,
      req.params.end
    );
    const sessions = await Sessions.findSessionsOfPeriod(
      req.params.begin,
      req.params.end
    );
    const products = await Sessions.findProductsSellOfPeriod(
      req.params.begin,
      req.params.end
    );
    const expenses = await MoneyTransactions.findExpensesPeriod(
      req.params.begin,
      req.params.end
    );
    const expensesTransactions =
      await MoneyTransactions.findExpensesTransactionPeriod(
        req.params.begin,
        req.params.end
      );
    const allRecipe = await MoneyTransactions.findRecipePeriod(
      req.params.begin,
      req.params.end
    );

    res.status(200).json({
      find: true,
      recipe: recipe[0].recipe,
      sessions: sessions,
      productsSell: products,
      expenses: expenses[0].expenses,
      allRecipe: allRecipe[0].recipe,
      expensesTransactions: expensesTransactions,
    });
  } catch (error) {
    res.status(500).json({ error: true, errorMessage: error });
  }
};

exports.printInvoice = async (req, res) => {
  try {
    const session = await Sessions.find({ idSession: req.params.idSession });
    req.app
      .get("socketService")
      .broadcastEmiter(session[0].invoiceUrl, "print-session");

    return res.status(200).json({ update: true });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
};

exports.generateVoucherForDrinks = async (req, res) => {
  try {
    console.log("SCUMMMMMMM");
    const now = moment();
    const items = await Sessions.customQuery(
      "SELECT i.nameOfProduct as nameOfProduct, i.quantity-taken as quantity2print, i.price as price from sessionsItem i left join products p on p.idProduct = i.idProduct WHERE i.quantity != taken AND i.idSession = ? AND (p.type = 'Boissons' OR p.type='Cigarettes' OR p.type='Spiritueux')",
      [req.params.idSession]
    );
    
    console.log(items);
    await Sessions.customQuery(
      "UPDATE sessionsItem i left join products p on p.idProduct = i.idProduct SET i.taken = i.quantity WHERE i.idSession = ? AND (p.type = 'Boissons' OR p.type='Cigarettes' OR p.type='Spiritueux')",
      [req.params.idSession]
    );

    const number = fs.readFileSync(
      path.join(__dirname, "../Assets/", "number-voucher.txt"),
      "utf-8"
    );

    const nameOfTemplate = "voucher.ejs";
    const data = {
      data: {
        items: items,
        date: now.format("DD/MM/yyyy"),
        hours: now.format("H:mm"),
        number: number,
        nameOfServer: req.session.nameOfServer,
        client: req.session.nameOfClient,
      },
    };

    ejs.renderFile(
      path.join(__dirname, "../Assets/", nameOfTemplate),
      data,
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let options = {
            width: "7.5cm",
            localUrlAccess: true,
          };

          const nameOfFile = `Bon_${number}_${req.session.nameOfClient}.pdf`;
          pdf
            .create(data, options)
            .toFile(`Invoices/Vouchers/${nameOfFile}`, (err, data) => {
              if (err) {
                console.log(err);
              } else {
                Sessions.customQuery("INSERT INTO vouchers SET ?", {
                  voucherUrl: `${req.protocol}://le-consulat-drc.com/Vouchers/${nameOfFile}`,
                  nameOfServer: req.session.nameOfServer,
                  nameOfClient: req.session.nameOfClient,
                  timestamp: now.unix(),
                })
                  .then(() => {
                    fs.writeFile(
                      path.join(__dirname, "../Assets/", "number-voucher.txt"),
                      `${Number(number) + 1}`,
                      "utf8",
                      () => {
                        req.app
                          .get("socketService")
                          .broadcastEmiter( `${req.protocol}://le-consulat-drc.com/Vouchers/${nameOfFile}`, "print-session");
                        res.status(200).json({ update: true });
                      }
                    );
                  })
                  .catch((error) => {
                    console.log(error);
                    res.status(500).json({ error: true, errorMessage: error });
                  });
              }
            });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
};

exports.generateVoucherForFoods = async (req, res) => {
  try {
    console.log("SCUMMMMMMM");
    const now = moment();
    const items = await Sessions.customQuery(
      "SELECT i.nameOfProduct as nameOfProduct, i.quantity-taken as quantity2print, i.price as price from sessionsItem i left join products p on p.idProduct = i.idProduct WHERE i.quantity != taken AND i.idSession = ? AND (p.type = 'Plâts')",
      [req.params.idSession]
    );
    
    console.log(items);
    await Sessions.customQuery(
      "UPDATE sessionsItem i left join products p on p.idProduct = i.idProduct SET i.taken = i.quantity WHERE i.idSession = ? AND (p.type='Plâts')",
      [req.params.idSession]
    );

    const number = fs.readFileSync(
      path.join(__dirname, "../Assets/", "number-voucher.txt"),
      "utf-8"
    );

    const nameOfTemplate = "voucher.ejs";
    const data = {
      data: {
        items: items,
        date: now.format("DD/MM/yyyy"),
        hours: now.format("H:mm"),
        number: number,
        nameOfServer: req.session.nameOfServer,
        client: req.session.nameOfClient,
      },
    };

    ejs.renderFile(
      path.join(__dirname, "../Assets/", nameOfTemplate),
      data,
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let options = {
            width: "7.5cm",
            localUrlAccess: true,
          };

          const nameOfFile = `Bon_${number}_${req.session.nameOfClient}.pdf`;
          pdf
            .create(data, options)
            .toFile(`Invoices/Vouchers/${nameOfFile}`, (err, data) => {
              if (err) {
                console.log(err);
              } else {
                Sessions.customQuery("INSERT INTO vouchers SET ?", {
                  voucherUrl: `${req.protocol}://le-consulat-drc.com/Vouchers/${nameOfFile}`,
                  nameOfServer: req.session.nameOfServer,
                  nameOfClient: req.session.nameOfClient,
                  timestamp: now.unix(),
                })
                  .then(() => {
                    fs.writeFile(
                      path.join(__dirname, "../Assets/", "number-voucher.txt"),
                      `${Number(number) + 1}`,
                      "utf8",
                      () => {
                        req.app
                          .get("socketService")
                          .broadcastEmiter( `${req.protocol}://le-consulat-drc.com/Vouchers/${nameOfFile}`, "print-session");
                        res.status(200).json({ update: true });
                      }
                    );
                  })
                  .catch((error) => {
                    console.log(error);
                    res.status(500).json({ error: true, errorMessage: error });
                  });
              }
            });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
};

exports.getSessionsPrintWorks = async (req, res) => {
  try {
    
    const sessions = await Sessions.customQuery("SELECT * FROM sessions WHERE wasOver = 1 AND timestamp >= ? ORDER BY idSession DESC", [moment().startOf('day').unix()]);

    return res.status(200).json({ find: true, sessions: sessions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
}

exports.getVouchersPrintWorkds = async (req, res) => {
  try {
    
    const vouchers = await Sessions.customQuery("SELECT * FROM vouchers WHERE timestamp >= ? ORDER BY idVoucher DESC", [moment().startOf('day').unix()]);

    return res.status(200).json({ find: true, vouchers: vouchers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true });
  }
}
