const router = require('express').Router();

const limits = require('../Middlewares/Limits/limits');

const authAdmin = require('../Middlewares/Auth/authAdmin');
const auth = require('../Middlewares/Auth/auth');
const existProduct = require('../Middlewares/Exists/existProduct');
const validatorProduct = require('../Middlewares/Validators/validatorProduct');

const productsCtrl = require('../Controllers/Products');

router.post('/', limits(8000, 15), authAdmin, validatorProduct, productsCtrl.addOneProduct); // Ajoute un nouveau produit, uniquement par l'administrateur

router.put('/:idProduct', limits(8000, 15), existProduct, authAdmin, validatorProduct, productsCtrl.updateOneProduct); // Modifie un produit, uniquement par l'administrateur

router.get('/:idProduct', limits(8000, 15), existProduct, auth, productsCtrl.getOneProduct); // Récupère un produit
router.get('/special/type/most-popular-type', limits(8000, 15), auth, productsCtrl.getMostPopularType); // Récupère les types les plus populaire
router.get('/special/most-popular', limits(8000, 15), auth, productsCtrl.getMostPopularProducts); // Récupère les produts les plus populaire par catégorie
router.get('/', limits(8000, 15), auth, productsCtrl.getAllProduct); // Récupère tout les produits, uniquement par l'administrateur

router.delete('/:idProduct', limits(8000, 15), existProduct, authAdmin, productsCtrl.deleteOneProduct); // Supprime un produit, uniquement par l'administrateur

module.exports = router;