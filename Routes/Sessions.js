const router = require('express').Router();

const limits = require('../Middlewares/Limits/limits');

const auth = require('../Middlewares/Auth/auth');

const validatorSession = require('../Middlewares/Validators/validatorSession');
const verifyIsNotFinish = require('../Middlewares/Validators/verifyIsNotFinish');
const verifyIsFinish = require('../Middlewares/Validators/verifyIsFinish');
const validatorSessionItem = require('../Middlewares/Validators/validatorSessionItem');
const validatorAccompaniment = require('../Middlewares/Validators/validatorAccompaniment');

const existSession = require('../Middlewares/Exists/existSession');
const existItem = require('../Middlewares/Exists/existItem');

const sessionCtrl = require('../Controllers/Sessions');
const generator = require('../Controllers/Generator');

router.post('/', limits(8000, 15), auth, validatorSession, sessionCtrl.startNewSession); // Commence une nouvelle session

router.put('/:idSession', limits(8000, 15), existSession, verifyIsNotFinish, auth, validatorSession, sessionCtrl.updateSession); // Modifie les informations d'une session
router.put('/:idSession/addItem', limits(8000, 15), existSession, verifyIsNotFinish, auth, validatorSessionItem, sessionCtrl.addItemToSession); // Ajoute un item à une session
router.put('/:idSession/item/:idItem', limits(8000, 15), existSession, existItem, verifyIsNotFinish, auth, validatorSessionItem, sessionCtrl.updateItemOfSession); // Modifie un item d'une session
router.put('/:idSession/item/:idItem/addAccompaniment', limits(8000, 15), existSession, existItem, verifyIsNotFinish, auth, validatorAccompaniment, sessionCtrl.addAccompanimentToSessionItem); // Ajoute un accompagnement à l'item d'une session
router.put('/:idSession/finishAndPay', limits(8000, 15), existSession, verifyIsNotFinish, auth, sessionCtrl.finishAndPay, generator); // Termine une session, la paie et génére la facture
router.put('/:idSession/finish', limits(8000, 15), existSession, verifyIsNotFinish, auth, sessionCtrl.finish, generator); // Termine une session et génére la facture
router.put('/:idSession/pay', limits(8000, 15), existSession, verifyIsFinish, auth, sessionCtrl.pay); // Paye une session si elle est déjà terminer
router.put('/:idSession/reduction', limits(8000, 15), existSession, verifyIsNotFinish, auth, sessionCtrl.addReduction); // Rajoute une réduction à une session
router.put('/:idSession/reductionToZero', limits(8000, 15), existSession, verifyIsNotFinish, auth, sessionCtrl.reductionToZero); // Rajoute une réduction à une session

router.get('/', limits(8000, 15), auth, sessionCtrl.getAllSession); // Récupère toute les sessions
router.get('/:idSession', limits(8000, 15), existSession, auth, sessionCtrl.getOneSession); // Récupère une session
router.get('/get/report/:timestamp', limits(8000, 15), auth, sessionCtrl.getReport); // Renvoie le rapport d'une journée
router.get('/get/report/:begin/:end', limits(8000, 15), auth, sessionCtrl.getReportPeriod); // Renvoie le rapport d'une journée
router.get('/:idSession/items', limits(8000, 15), existSession, auth, sessionCtrl.getItemOfSession); // Récupère les items d'une session
router.get('/:idSession/items/:idItem/accompaniment', limits(8000, 15), existSession, existItem, auth, sessionCtrl.getAccompanimentOfItem); // Récupère les accompagnement d'un item
router.get('/get/notFinished', limits(8000, 15), auth, sessionCtrl.getNotFinished); // Récupère les sessions non terminées
router.get('/get/notPaid', limits(8000, 15), auth, sessionCtrl.getNotPaied); // Récupère les sessions non payé mais terminé
router.get('/get/finished', limits(8000, 15), auth, sessionCtrl.getFinished); // Récupère les sessions finit

router.delete('/:idSession/items/:idItem', limits(8000, 15), existSession, existItem, verifyIsNotFinish, auth, sessionCtrl.deleteOneItem); // Supprime une élément d'une session

module.exports = router;