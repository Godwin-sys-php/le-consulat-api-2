const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const xss = require('xss');
const _ = require('lodash');
const path = require('path');

const usersRoute = require('./Routes/Users');
const clientsRoute = require('./Routes/Clients');
const productsRoute = require('./Routes/Products');
const sessionsRoute = require('./Routes/Sessions');
const transactionsRoute = require('./Routes/Transactions');
const moneyTransactionsRoute = require('./Routes/MoneyTransactions');

const app = express();


app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use((req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    for (let index in req.body) {
      if (_.isString(req.body[index])) {
        req.body[index] = req.body[index].trim();
        req.body[index] = xss(req.body[index]);
      }
    }
    next();
  } else {
    next();
  }
});

app.use(
  "/Invoices",
  express.static(path.join(__dirname, "Invoices"))
);

app.use('/web', (express.static(path.join(__dirname, 'build'))));
app.get('/application/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
  
app.get('/', (req, res) => {
	res.redirect("/application/");
});
app.use('/api/users', usersRoute);
app.use('/api/clients', clientsRoute);
app.use('/api/products', productsRoute);
app.use('/api/sessions', sessionsRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/money-transactions', moneyTransactionsRoute);

module.exports = app;
