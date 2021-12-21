const router = require('express').Router();

const limits = require('../Middlewares/Limits/limits');
const authAdmin = require('../Middlewares/Auth/authAdmin');
const validatorMoneyTransactions = require('../Middlewares/Validators/validatorMoneyTransactions');
const validatorCategory = require('../Middlewares/Validators/validatorCategory');
const existCategory = require('../Middlewares/Exists/existCategory');

const moneyTransactionsCtrl = require('../Controllers/MoneyTransactions');

router.post('/enter', limits(8000, 15), authAdmin, validatorMoneyTransactions, moneyTransactionsCtrl.addEnter);
router.post('/outlet', limits(8000, 15), authAdmin, validatorMoneyTransactions, moneyTransactionsCtrl.addOutlet);
router.post('/category', limits(8000, 15), authAdmin, validatorCategory, moneyTransactionsCtrl.addCategory);

router.put('/category/:idCategory', limits(8000, 15), authAdmin, existCategory, validatorCategory, moneyTransactionsCtrl.updateCategory);

router.get('/category', limits(8000, 15), authAdmin, moneyTransactionsCtrl.getAllCategories);
router.get('/category/:idCategory', limits(8000, 15), authAdmin, existCategory, moneyTransactionsCtrl.getOneCategory);
router.get('/category/most-popular/enter', limits(8000, 15), authAdmin, moneyTransactionsCtrl.getMostPopularEnterCategory);
router.get('/category/most-popular/outlet', limits(8000, 15), authAdmin, moneyTransactionsCtrl.getMostPopularOutletCategory);
router.get('/transactions/begin/:begin/end/:end', limits(8000, 15), authAdmin, moneyTransactionsCtrl.getAllTransactions);

module.exports = router;