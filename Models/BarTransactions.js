const Base = require('./Base');
const path = require('path');
const fs = require('fs');

class BarTransactions extends Base {
  constructor() {
    super();
  }

  insertOne(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO barTransactions SET ?', toInsert,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  find(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM barTransactions WHERE ?', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }


  findLast(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM barTransactions WHERE ? ORDER BY idTransaction DESC LIMIT 1', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOfProductFromOneDay(idProduct, begin) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT nameOfProduct, SUM(enter) as enter, SUM(outlet) as outlet FROM barTransactions WHERE idProduct=? AND timestamp >= ? AND timestamp < ?', [idProduct, Number(begin), Number(begin) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOfOneProductWithTimestamp(idProduct, begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT nameOfProduct, SUM(enter) as totalEnter, SUM(outlet) as totalOutlet, nameOfUser FROM barTransactions WHERE idProduct=? AND timestamp >= ? AND timestamp < ?', [idProduct, Number(begin), Number(end)],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findStockOfOneProductWithTimestamp(idProduct, begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT stockAfter+outlet-enter as stockAfter FROM barTransactions WHERE idProduct=? AND timestamp >= ? AND timestamp < ? ORDER BY idTransaction LIMIT 1', [idProduct, Number(begin), Number(end)],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findBeginOfProductFromOneDay(idProduct, begin) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT stockAfter FROM barTransactions WHERE idProduct=? AND timestamp < ? ORDER BY idTransaction LIMIT 1', [idProduct, Number(begin) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findEndOfProductFromOneDay(idProduct, begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT stockAfter FROM barTransactions WHERE idProduct=? AND timestamp < ? ORDER BY idTransaction DESC LIMIT 1', [idProduct, Number(begin) + 86400],
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
        'SELECT * FROM barTransactions',
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  customQuery(query, params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        query, params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

module.exports = new BarTransactions();