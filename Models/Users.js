const Base = require('./Base');

class Users extends Base {
  constructor() {
    super();
  }

  insertOne(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO users SET ?', toInsert,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOne(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM users WHERE ?', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOneWithoutPassword(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT idUser, name, pseudo, level, creationDate FROM users WHERE ?', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOneWithoutAnID(params, id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM users WHERE ? AND idUser <> ?', [params, id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findAll() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM users',
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findAllWithoutPassword() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT idUser, name, pseudo, level, creationDate FROM users',
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  updateOne(toSet, id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "UPDATE users SET ? WHERE idUser=?", [toSet, id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  deleteOne(id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "DELETE FROM users WHERE idUser=?", [id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

module.exports = new Users();