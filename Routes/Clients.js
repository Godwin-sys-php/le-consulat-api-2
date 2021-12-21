const router = require('express').Router();

const limits = require('../Middlewares/Limits/limits');

const auth = require('../Middlewares/Auth/auth');
const existClient = require('../Middlewares/Exists/existClient');
const validatorClient = require('../Middlewares/Validators/validatorClient');

const clientCtrl = require('../Controllers/Clients');

router.post('/', limits(8000, 15), auth, validatorClient, clientCtrl.addOneClient); // Ajoute un client

router.put('/:idClient', limits(8000, 15), existClient, auth, validatorClient, clientCtrl.updateOneClient); // Modifie un client

router.get('/:idClient', limits(8000, 15), existClient, auth, clientCtrl.getOneClient); // Récupère un client
router.get('/', limits(8000, 15), auth, clientCtrl.getAllClient); // Récupère tout les clients

router.delete('/:idClient', limits(8000, 15), existClient, auth, clientCtrl.deleteOneClient); // Supprime un client

module.exports = router;