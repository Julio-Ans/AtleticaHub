const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verificarToken = require('../middlewares/verificarToken');

// Listar itens do carrinho
router.get('/', verificarToken, cartController.listar);

// Adicionar item ao carrinho
router.post('/', verificarToken, cartController.adicionar);

// Atualizar quantidade de um item
router.put('/:id', verificarToken, cartController.atualizarQuantidade);

// Remover item do carrinho
router.delete('/:id', verificarToken, cartController.remover);

// Finalizar pedido (checkout)
router.post('/checkout', verificarToken, cartController.checkout);

// Limpar carrinho
router.delete('/', verificarToken, cartController.limpar);

module.exports = router;
