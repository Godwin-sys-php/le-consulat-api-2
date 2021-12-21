const User = require('../../Models/Users');
const passwordValidator = require("password-validator");
const _ = require('lodash');

module.exports = (req, res, next) => {
  try {
    const schema = new passwordValidator();// On crée une nouvelle instance de l'objet
    schema// On crée un nouveau schéma
      .is().min(8)                                    // Minimum length 8
      .has().uppercase()                              // Must have uppercase letters
      .has().lowercase()                              // Must have lowercase letters
      .has().digits(2)                                // Must have at least 2 digits
    
    if (req.method == 'PUT') {
      if (req.body.password) {
        if (schema.validate(req.body.password) && (req.body.name.length >= 2 && req.body.name.length < 30 && _.isString(req.body.name)) && (req.body.pseudo.length >= 2 && req.body.pseudo.length < 30 && _.isString(req.body.pseudo)) && (req.body.level >= 1 && req.body.level <= 3)) {
          User.findOneWithoutAnID({ pseudo: req.body.pseudo }, req.params.idUser)
            .then(user => {
              if (user.length < 1) {
                User.findOne({ level: 1 })
                  .then(users => {
                    if (users.length == 1 && users[0].idUser == req.params.idUser && req.body.level > 1) {
                      res.status(400).json({ cantChangeLevelOfLastAdmin: true });
                    } else {
                      next();
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({ error: true, errorMessage: error });
                  });
              } else {
                res.status(400).json({ existPseudo: true });
              }
            })
            .catch((error) => {
              res.status(500).json({ error: true, errorMessage: error });
            });
        } else {
          res.status(400).json({ invalidForm: true });
        }
      } else {
        if ((req.body.name.length >= 2 && req.body.name.length < 30 && _.isString(req.body.name)) && (req.body.pseudo.length >= 2 && req.body.pseudo.length < 30 && _.isString(req.body.pseudo)) && (req.body.level >= 1 && req.body.level <= 3)) {
          User.findOneWithoutAnID({ pseudo: req.body.pseudo }, req.params.idUser)
            .then(user => {
              if (user.length < 1) {
                User.findOne({ level: 1 })
                  .then(users => {
                    if (users.length == 1 && users[0].idUser == req.params.idUser && req.body.level > 1) {
                      res.status(400).json({ cantChangeLevelOfLastAdmin: true });
                    } else {
                      next();
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({ error: true, errorMessage: error });
                  });
              } else {
                res.status(400).json({ existPseudo: true });
              }
            })
            .catch((error) => {
              res.status(500).json({ error: true, errorMessage: error });
            });
        } else {
          res.status(400).json({ invalidForm: true });
        }
      }
    } else {
      if (schema.validate(req.body.password) && (req.body.name.length >= 2 && req.body.name.length < 30 && _.isString(req.body.name)) && (req.body.pseudo.length >= 2 && req.body.pseudo.length < 30 && _.isString(req.body.pseudo)) && (req.body.level >= 1 && req.body.level <= 3)) {
        User.findOne({ pseudo: req.body.pseudo })
          .then(user => {
            user.length < 1 ? next() : res.status(400).json({ existPseudo: true });
          })
          .catch((error) => {
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