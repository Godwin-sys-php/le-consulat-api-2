const Clients = require('../Models/Clients');
const moment = require('moment');
const MoneyTransactions = require('../Models/MoneyTransactions');

exports.addOneClient = (req, res) => {
  let toInsert;
  const now = moment();
  toInsert = {
    name: req.body.name,
    nameOfUser: req.user.name,
    timestamp: now.unix(),
  };

  if (req.body.phoneNumber) {
    toInsert.phoneNumber = req.body.phoneNumber;
  }
  if (req.body.email) {
    toInsert.email = req.body.email;
  }
  if (req.body.birthday) {
    toInsert.birthday = req.body.birthday;
  }

  Clients.insertOne(toInsert)
    .then(() => {
      res.status(201).json({ create: true });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.updateOneClient = (req, res) => {
  let toSet;
  toSet = {
    name: req.body.name,
  };

  if (req.body.phoneNumber) {
    toSet.phoneNumber = req.body.phoneNumber;
  }
  if (req.body.email) {
    toSet.email = req.body.email;
  }
  if (req.body.birthday) {
    toSet.birthday = req.body.birthday;
  }

  Clients.updateOne(toSet, req.params.idClient)
    .then(() => {
      res.status(200).json({ update: true });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getOneClient = (req, res) => {
  Clients.findOne({ idClient: req.params.idClient })
    .then(client => {
      res.status(200).json({ find: true, result: client[0] });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getAllClient = (req, res) => {
  Clients.findAll()
    .then(clients => {
      res.status(200).json({ find: true, result: clients });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.deleteOneClient = (req, res) => {
  Clients.deleteOne(req.params.idClient)
    .then(() => {
      res.status(200).json({ delete: true });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};