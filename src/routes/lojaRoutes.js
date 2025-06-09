const express = require('express');
const router = express.Router();
const produtoCtrl = require('../controllers/produtoController');
const cartCtrl    = require('../controllers/cartController');
const pedidoCtrl  = require('../controllers/pedidoController');

// Produtos
router.post('/produtos', produtoCtrl.create);
router.get ('/produtos', produtoCtrl.list);
router.put ('/produtos/:id', produtoCtrl.update);
router.delete('/produtos/:id', produtoCtrl.remove);

// Carrinho
router.post('/cart',     cartCtrl.add);
router.get ('/cart',     cartCtrl.list);
router.put ('/cart/:id',  cartCtrl.update);
router.delete('/cart/:id', cartCtrl.remove);
router.post('/checkout', cartCtrl.checkout);

// Pedidos
router.get ('/pedidos',            pedidoCtrl.list);
router.post('/pedidos/:id/payment', pedidoCtrl.pay);

module.exports = router;
