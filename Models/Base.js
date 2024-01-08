const mysql = require('mysql2');

require('dotenv').config();

class Base {
  constructor(){ 
    this.bdd = mysql.createPool({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      charset: process.env.DATABASE_CHARSET,
    });
  }
}

module.exports = Base;
