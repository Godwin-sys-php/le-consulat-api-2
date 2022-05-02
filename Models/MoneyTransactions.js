const Base = require('./Base');

class MoneyTransactions extends Base {
  constructor() {
    super();
  }

  insertOne(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "INSERT INTO moneyTransactions SET ?", toInsert,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  insertOneCategory(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "INSERT INTO categoriesMoneyTransactions SET ?", toInsert,
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
        "SELECT * FROM moneyTransactions WHERE ?", params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findWithTimestamp(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT mt.*, cmt.name AS nameOfCategory FROM moneyTransactions mt LEFT JOIN categoriesMoneyTransactions cmt ON mt.idCategory = cmt.idCategory WHERE timestamp >= ? AND timestamp < ?", [begin, end],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findBeginWithTimestamp(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT amountAfter FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ? ORDER BY idMoneyTransaction LIMIT 1", [begin, end],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findEndWithTimestamp(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT amountAfter FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ? ORDER BY idMoneyTransaction DESC LIMIT 1", [begin, end],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findSumEnterWithTimestamp(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT SUM(enter) AS sumEnter FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ?", [begin, end],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findSumOutletWithTimestamp(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT SUM(outlet) AS sumOutlet FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ?", [begin, end],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findLast() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM moneyTransactions ORDER BY idMoneyTransaction DESC LIMIT 1',
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOneCategory(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT * FROM categoriesMoneyTransactions WHERE ?", params,
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
        "SELECT * FROM moneyTransactions mt JOIN categoriesMoneyTransactions cmt ON mt.idCategory = cmt.idCategory",
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findAllCategories() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "SELECT * FROM categoriesMoneyTransactions",
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findExpenses(timestamp) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT SUM(outlet) AS expenses FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ? AND description != "Changement de paramètre de paiement"', [Number(timestamp), Number(timestamp) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findExpensesPeriod(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT SUM(outlet) AS expenses FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ?', [Number(begin), Number(end) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findExpensesTransaction(timestamp) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT mt.*, cmt.name as nameOfCategory FROM moneyTransactions mt LEFT JOIN categoriesMoneyTransactions cmt ON mt.idCategory = cmt.idCategory WHERE mt.timestamp >= ? AND mt.timestamp < ? AND mt.outlet > 0', [Number(timestamp), Number(timestamp) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findExpensesTransactionPeriod(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT mt.*, cmt.name as nameOfCategory FROM moneyTransactions mt LEFT JOIN categoriesMoneyTransactions cmt ON mt.idCategory = cmt.idCategory WHERE mt.timestamp >= ? AND mt.timestamp < ? AND mt.outlet > 0', [Number(begin), Number(end) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findRecipe(timestamp) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT SUM(enter) AS recipe FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ?', [Number(timestamp), Number(timestamp) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findRecipePeriod(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT SUM(enter) AS recipe FROM moneyTransactions WHERE timestamp >= ? AND timestamp < ?', [Number(begin), Number(end) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findMostPopularCategoryEnter() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT mt.idCategory, COUNT(mt.idCategory) AS value_occurrence, cmt.name AS nameOfCategory FROM moneyTransactions mt LEFT JOIN categoriesMoneyTransactions cmt ON mt.idCategory = cmt.idCategory WHERE cmt.type="enter" GROUP BY mt.idCategory ORDER BY value_occurrence DESC LIMIT 3;', [],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findMostPopularCategoryOutlet() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT mt.idCategory, COUNT(mt.idCategory) AS value_occurrence, cmt.name AS nameOfCategory FROM moneyTransactions mt LEFT JOIN categoriesMoneyTransactions cmt ON mt.idCategory = cmt.idCategory WHERE cmt.type="outlet" GROUP BY mt.idCategory ORDER BY value_occurrence DESC LIMIT 3;', [],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  updateOneCategory(toSet, params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "UPDATE categoriesMoneyTransactions SET ? WHERE ?", [toSet, params],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  delete(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "DELETE FROM moneyTransactions WHERE ?", params,
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

module.exports = new MoneyTransactions();