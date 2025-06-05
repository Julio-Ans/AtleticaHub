const express = require('express');
const router = express.Router();
const cartCtrl = require('../controllers/cartController');
const verificarToken = require('../middlewares/verificarToken');

router.get('/', verificarToken, cartCtrl.listCart);
router.post('/', verificarToken, cartCtrl.addToCart);
router.delete('/:id', verificarToken, cartCtrl.removeFromCart);
router.post('/checkout', verificarToken, cartCtrl.checkout);

module.exports = router;
