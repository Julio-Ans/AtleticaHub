const express = require('express');
const cartController = require('../controllers/cartController');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

// Todas as rotas do carrinho requerem autenticação
router.use(verificarToken);

// Gerenciar carrinho
router.post('/', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);

// Finalizar pedido
router.post('/checkout', cartController.checkout);

module.exports = router;
