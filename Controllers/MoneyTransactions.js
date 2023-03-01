const MoneyTransactions = require("../Models/MoneyTransactions");
const moment = require("moment");

exports.addEnter = (req, res) => {
  const now = moment();
  const toInsert = {
    idUser: req.user.idUser,
    idCategory: req.body.idCategory,
    idMethod: req.body.paymentMethod,
    enter: req.body.amount,
    outlet: 0,
    description: req.body.description,
    timestamp: now.unix(),
  };

  MoneyTransactions.findOneCategory({ idCategory: req.body.idCategory })
    .then(async (categories) => {
      if (categories[0].type === "enter") {
        const last = await MoneyTransactions.customQuery(
          "SELECT * FROM methods WHERE idMethod = ?",
          [req.body.paymentMethod]
        );
        MoneyTransactions.findLast()
          .then((transaction) =>
            MoneyTransactions.insertOne({
              ...toInsert,
              amountAfter:
                Number(transaction[0].amountAfter) + Number(req.body.amount),
              amountAfterMethod:
                Number(last[0].amount) + Number(req.body.amount),
            })
          )
          .then(async () => {
            await MoneyTransactions.customQuery(
              "UPDATE methods SET amount = ? WHERE idMethod = ?",
              [last[0].amount + req.body.amount, req.body.paymentMethod]
            );
            res.status(200).json({ create: true });
          })
          .catch((err) => {
            res.status(500).json({ error: true, errorMessage: err });
          });
      } else {
        res.status(400).json({ invalidForm: true });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: true, errorMessage: err });
    });
};

exports.addOutlet = async (req, res) => {
  const now = moment();
  const toInsert = {
    idUser: req.user.idUser,
    idCategory: req.body.idCategory,
    idMethod: req.body.paymentMethod,
    enter: 0,
    outlet: req.body.amount,
    description: req.body.description,
    timestamp: now.unix(),
  };
  const last4Method = await MoneyTransactions.customQuery(
    "SELECT * FROM methods WHERE idMethod = ?",
    [req.body.paymentMethod]
  );

  await MoneyTransactions.findOneCategory({ idCategory: req.body.idCategory })
    .then((categories) => {
      if (categories[0].type === "outlet") {
        MoneyTransactions.findLast().then((transaction) => {
          if (
            Number(last4Method[0].amount) - Number(req.body.amount) <
            0
          ) {
            res.status(200).json({ negativeMoney: true });
          } else {
            MoneyTransactions.insertOne({
              ...toInsert,
              amountAfterMethod:
                Number(last4Method[0].amount) - Number(req.body.amount),
              amountAfter:
                Number(transaction[0].amountAfter) - Number(req.body.amount),
            })
              .then(async () => {
                const last = await MoneyTransactions.customQuery(
                  "SELECT * FROM methods WHERE idMethod = ?",
                  [req.body.paymentMethod]
                );
                await MoneyTransactions.customQuery(
                  "UPDATE methods SET amount = ? WHERE idMethod = ?",
                  [last[0].amount - req.body.amount, req.body.paymentMethod]
                );

                return res.status(200).json({ create: true });
              })
              .catch((err) => {
                return res.status(500).json({ error: true, errorMessage: err });
              });
          }
        });
      } else {
        return res.status(400).json({ invalidForm: true });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: true, errorMessage: err });
    });
};

exports.addCategory = (req, res) => {
  const toInsert = {
    idUser: req.user.idUser,
    type: req.body.type,
    name: req.body.name,
  };

  MoneyTransactions.insertOneCategory(toInsert)
    .then(() => {
      res.status(200).json({ create: true });
    })
    .catch((err) => {
      res.status(500).json({ error: true, errorMessage: err });
    });
};

exports.updateCategory = (req, res) => {
  const toSet = {
    idUser: req.user.idUser,
    name: req.body.name,
  };

  MoneyTransactions.updateOneCategory(toSet, {
    idCategory: req.params.idCategory,
  })
    .then(() => {
      res.status(200).json({ update: true });
    })
    .catch((err) => {
      res.status(500).json({ error: true, errorMessage: err });
    });
};

exports.getAllCategories = (req, res) => {
  MoneyTransactions.findAllCategories()
    .then((categories) => {
      res.status(200).json({ find: true, result: categories });
    })
    .catch((err) => {
      res.status(500).json({ error: true, errorMessage: err });
    });
};

exports.getOneCategory = (req, res) => {
  MoneyTransactions.findOneCategory({ idCategory: req.params.idCategory })
    .then((categories) => {
      res.status(200).json({ find: true, result: categories[0] });
    })
    .catch((err) => {
      res.status(500).json({ error: true, errorMessage: err });
    });
};

exports.getAllTransactions = async (req, res) => {
  try {
    const Transactions = await MoneyTransactions.findWithTimestamp(
      req.params.begin,
      req.params.end
    );
    const Begin = await MoneyTransactions.findBeginWithTimestamp(
      req.params.begin,
      req.params.end
    );
    const End = await MoneyTransactions.findEndWithTimestamp(
      req.params.begin,
      req.params.end
    );
    const SumEnter = await MoneyTransactions.findSumEnterWithTimestamp(
      req.params.begin,
      req.params.end
    );
    const SumOutlet = await MoneyTransactions.findSumOutletWithTimestamp(
      req.params.begin,
      req.params.end
    );
    const ActiveMethods = await MoneyTransactions.customQuery("SELECT * FROM methods WHERE idMethod = 1 OR idMethod = 2 OR idMethod = 3");

    let newTransactions = [];
    for (let index in Transactions) {
      const method = await MoneyTransactions.customQuery("SELECT * FROM methods WHERE idMethod = ?", [Transactions[index].idMethod]);
      newTransactions.push({ ...Transactions[index], nameOfMethod: method[0].name });
    }

    res.status(200).json({
      find: true,
      result: {
        transaction: newTransactions,
        begin: Begin,
        end: End,
        sumEnter: SumEnter,
        sumOutlet: SumOutlet,
        activeMethods: ActiveMethods,
      },
    });
  } catch (err) {
    res.status(500).json({ error: true, errorMessage: err });
  }
};

exports.getMostPopularEnterCategory = async (req, res) => {
  try {
    const mpcEnter = await MoneyTransactions.findMostPopularCategoryEnter();

    res.status(200).json({ find: true, result: mpcEnter });
  } catch (err) {
    res.status(500).json({ error: true, errorMessage: err });
  }
};

exports.getMostPopularOutletCategory = async (req, res) => {
  try {
    const mpcOutlet = await MoneyTransactions.findMostPopularCategoryOutlet();

    res.status(200).json({ find: true, result: mpcOutlet });
  } catch (err) {
    res.status(500).json({ error: true, errorMessage: err });
  }
};
