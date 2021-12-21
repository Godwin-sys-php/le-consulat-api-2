const Base = require('./Base');

class Clients extends Base {
  constructor() {
    super();
  }

  insertOne(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO clients SET ?', toInsert,
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
        'SELECT * FROM clients WHERE ?', params,
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
        'SELECT * FROM clients',
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
        'SELECT * FROM clients WHERE ? AND idClient <> ?', [params, id],
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
        "UPDATE clients SET ? WHERE idClient=?", [toSet, id],
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
        "DELETE FROM clients WHERE idClient=?", [id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

module.exports = new Clients();