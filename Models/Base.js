const mysql = require('mysql');

require('dotenv').config();

class Base {
  constructor(){ 
    this.bdd = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      charset: process.env.DATABASE_CHARSET,
    });

    this.bdd.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
      }
     
      console.log('Connexion à MySQL réussite');
    });
  }
}

module.exports = Base;
