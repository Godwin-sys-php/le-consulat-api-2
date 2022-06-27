const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../Models/Users');

require('dotenv').config();

exports.login = (req, res) => {
  Users.findOne({ pseudo: req.body.pseudo })
    .then((user) => {
      if (user.length < 1) {
        res.status(404).json({ pseudo: false, password: false });
      } else {
        bcrypt.compare(req.body.password, user[0].password)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({ pseudo: true, password: false });
            } else {
              res.status(200).json({
                idUser: user[0].idUser,
                user: user[0],
                token: jwt.sign({ idUser: user[0].idUser, }, process.env.TOKEN, {
                  expiresIn: "2d",
                })
              });
            }
          })
          .catch(error => {
            console.log(error);
            res.status(500).json({ error: true, errorMessage: error });
          });
      }
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.addOneUser = (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const now = new Date();
      const toInsert = {
        name: req.body.name,
        pseudo: req.body.pseudo,
        password: hash,
        level: req.body.level,
        creationDate: now.toUTCString(),
      }
      Users.insertOne(toInsert)
        .then(() => {
          res.status(201).json({ create: true });
        })
        .catch(error => {
          res.status(500).json({ error: true, errorMessage: error });
        });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.updateOneUser = (req, res) => {
  let toSet;
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        toSet = {
          name: req.body.name,
          pseudo: req.body.pseudo,
          password: hash,
          level: req.body.level,
        };
        Users.updateOne(toSet, req.params.idUser)
          .then(() => {
            res.status(200).json({ update: true });
          })
          .catch(error => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      })
      .catch(error => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  } else {
    toSet = {
      name: req.body.name,
      pseudo: req.body.pseudo,
      level: req.body.level,
    };
    Users.updateOne(toSet, req.params.idUser)
      .then(() => {
        res.status(200).json({ update: true });
      })
      .catch(error => {
        res.status(500).json({ error: true, errorMessage: error });
      });
  }
};

exports.getOneUser = (req, res) => {
  Users.findOneWithoutPassword({ idUser: req.params.idUser })
    .then(user => {
      res.status(200).json({ find: true, result: user[0] });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.getAllUser = (req, res) => {
  Users.findAllWithoutPassword()
    .then(user => {
      res.status(200).json({ find: true, result: user });
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};

exports.deleteOneUser = (req, res) => {
  Users.findOne({ idUser: req.params.idUser })
    .then(user => {
      if (user[0].level === 1) {
        res.status(403).json({ cannotDeleteAdmin: true });
      } else {
        Users.deleteOne(req.params.idUser)
          .then(() => {
            res.status(200).json({ delete: true });
          })
          .catch(error => {
            res.status(500).json({ error: true, errorMessage: error });
          });
      }
    })
    .catch(error => {
      res.status(500).json({ error: true, errorMessage: error });
    });
};
