const Base = require('./Base');

class Products extends Base {
  constructor() {
    super();
  }

  insertOne(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO products SET ?', toInsert,
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
        'SELECT * FROM products WHERE ?', params,
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
        'SELECT * FROM products',
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
        'SELECT * FROM products WHERE ? AND idProduct <> ?', [params, id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findMostPopularType() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT  SUM(si.quantity) AS value_occurrence, p.type AS nameOfType FROM sessionsItem si JOIN products p ON si.idProduct = p.idProduct GROUP BY p.type ORDER BY `value_occurrence` DESC', [],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findMostPopularProducts(type) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT si.idProduct, COUNT(si.idProduct) * si.quantity AS value_occurrence, p.name AS nameOfProduct FROM sessionsItem si LEFT JOIN products p ON si.idProduct = p.idProduct LEFT JOIN sessions s ON si.idSession = s.idSession WHERE p.type = ? AND s.beenPaid = 1 GROUP BY p.idProduct ORDER BY value_occurrence DESC LIMIT 3;', [type],
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
        "UPDATE products SET ? WHERE idProduct=?", [toSet, id],
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
        "DELETE FROM products WHERE idProduct=?", [id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

module.exports = new Products();