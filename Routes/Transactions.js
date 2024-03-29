const router = require('express').Router();

const limits = require('../Middlewares/Limits/limits');
const authAdmin = require('../Middlewares/Auth/authAdmin');
const auth = require('../Middlewares/Auth/auth');
const authManager = require('../Middlewares/Auth/authManager');
const existProduct = require('../Middlewares/Exists/existProduct');
const validatorTransaction = require('../Middlewares/Validators/validatorTransaction');

const transactionCtrl = require('../Controllers/Transactions');

router.post('/:idProduct/enter', limits(8000, 15), existProduct, authManager, validatorTransaction, transactionCtrl.addEnter);
router.post('/:idProduct/outlet', limits(8000, 15), existProduct, authAdmin, validatorTransaction, transactionCtrl.addOutlet);
router.post('/:idProduct/enter-bar', limits(8000, 15), existProduct, authManager, validatorTransaction, transactionCtrl.addEnterBar);
router.post('/:idProduct/outlet-bar', limits(8000, 15), existProduct, authAdmin, validatorTransaction, transactionCtrl.addOutletBar);

router.get('/', limits(8000, 15), auth, transactionCtrl.getAllTransaction);
router.get('/period/:begin/:end', limits(8000, 15), auth, transactionCtrl.getTransactionsPeriod);
router.get('/period-bar/:begin/:end', limits(8000, 15), auth, transactionCtrl.getTransactionsPeriodBar);
router.get('/report/:begin/:end', limits(8000, 15), auth, transactionCtrl.getReport);
router.get('/:idProduct/day/:timestampBegin', limits(8000, 15), existProduct, auth, transactionCtrl.getOfOneDay);
router.get('/:idProduct', limits(8000, 15), existProduct, auth, transactionCtrl.getAllTransactionOfOneProduct);

module.exports = router;