const router = require('express').Router();

const limits = require('../Middlewares/Limits/limits');

const existUser = require('../Middlewares/Exists/existUser');
const authAdmin = require('../Middlewares/Auth/authAdmin');
const authAdminForUsers = require('../Middlewares/Auth/authAdminForUsers');
const validatorUser = require('../Middlewares/Validators/validatorUser');

const userCtrl = require('../Controllers/Users');

router.post('/login',  userCtrl.login); // Connecte un utilisateur
router.post('/', limits(8000, 15), authAdmin, validatorUser, userCtrl.addOneUser); // Ajoute un utilisateur, uniquement par l'administrateur

router.put('/:idUser', limits(8000, 15), existUser, authAdmin, validatorUser, userCtrl.updateOneUser); // Modifie un utilisateur, uniquement par l'administrateur

router.get('/:idUser', limits(8000, 15), existUser, authAdminForUsers, userCtrl.getOneUser); // Récupère un utilisateur, uniquement par l'administrateur ou par lui même
router.get('/', limits(8000, 15), authAdmin, userCtrl.getAllUser); // Récupère tout les utilisateur, uniquement par l'administrateur

router.delete('/:idUser', limits(8000, 15), existUser, authAdmin, userCtrl.deleteOneUser); // Supprime un utilisateur, uniquement par l'administrateur

module.exports = router;
