const Base = require('./Base');

class Sessions extends Base {
  constructor() {
    super();
  }

  insertOne(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO sessions SET ?', toInsert,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  insertItem(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO sessionsItem SET ?', toInsert,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  insertAccompaniment(toInsert) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'INSERT INTO accompaniment SET ?', toInsert,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  updateItem(toInsert, params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'UPDATE sessionsItem SET ? WHERE ?', [toInsert, params],
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
        'SELECT * FROM sessions WHERE ?', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  getNotPaid(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM sessions WHERE wasOver=1 AND beenPaid=0', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findItem(params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM sessionsItem WHERE ?', params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findAccompaniment(id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT *, products.name AS nameOfProduct, products.inStock AS inStock FROM accompaniment LEFT JOIN products ON accompaniment.idProduct = products.idProduct WHERE accompaniment.idSessionItem = ?', id,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findRecipeOfDay(timestamp) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT SUM(amountPaid) AS recipe FROM sessions WHERE timestamp >= ? AND timestamp < ? AND wasOver=1 AND beenPaid=1 AND idMethod != 4', [Number(timestamp), Number(timestamp) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findRecipeOfPeriod(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT SUM(amountPaid) AS recipe FROM sessions WHERE timestamp >= ? AND timestamp < ? AND wasOver=1 AND beenPaid=1 AND idMethod !== 4', [Number(begin), Number(end) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findSessionsOfDay(timestamp) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM sessions WHERE timestamp >= ? AND timestamp < ?', [Number(timestamp), Number(timestamp) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findSessionsOfPeriod(begin, end) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM sessions WHERE timestamp >= ? AND timestamp < ?', [Number(begin), Number(end) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findProductsSellOfDay(timestamp) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT si.idProduct, si.nameOfProduct, si.price, SUM(si.quantity) AS quantity FROM sessionsItem si JOIN sessions s ON s.idSession = si.idSession WHERE s.timestamp >= ? AND s.timestamp < ? GROUP BY si.idProduct'
      this.bdd.query(
        query, [Number(timestamp), Number(timestamp) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findProductsSellOfPeriod(begin, end) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT si.idProduct, si.nameOfProduct, si.price, SUM(si.quantity) AS quantity FROM sessionsItem si JOIN sessions s ON s.idSession = si.idSession WHERE s.timestamp >= ? AND s.timestamp < ? GROUP BY si.idProduct'
      this.bdd.query(
        query, [Number(begin), Number(end) + 86400],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findOneWithOther(id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM sessions, sessionsItem, accompaniment  WHERE sessions.idSession = sessionsItem.idSession AND accompaniment.idSessionItem = sessionsItem.idSessionsItem AND session.idSession = ?', id,
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
        'SELECT * FROM sessions',
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  findMethods() {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        'SELECT * FROM methods',
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

findServerOfADay(timestamp) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT SUM(total-reduction) as money, nameOfServer as name, COUNT(idSession) as nbrOfSession FROM sessions WHERE timestamp >= ? AND timestamp <= ? GROUP BY nameOfServer'
      this.bdd.query(
        query, [Number(timestamp), Number(timestamp) + 86400],
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
        'SELECT * FROM sessions WHERE ? AND idSession <> ?', [params, id],
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
        "UPDATE sessions SET ? WHERE idSession=?", [toSet, id],
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
        "DELETE FROM sessions WHERE idSession=?", [id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  deleteAccompAndItem(id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "DELETE sessionsItem, accompaniment FROM sessionsItem LEFT JOIN accompaniment ON accompaniment.idSessionItem= sessionsItem.idSessionsItem WHERE sessionsItem.idSessionsItem= ?", [id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  deleteOneItem(id) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        "DELETE FROM sessionsItem WHERE idSessionsItem=?", [id],
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  customQuery(req, params) {
    return new Promise((resolve, reject) => {
      this.bdd.query(
        req, params,
        (error, results, fields) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }
}

module.exports = new Sessions();
