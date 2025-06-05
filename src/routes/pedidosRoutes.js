const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');

// Criar pedido (user)
router.post('/', verificarToken, checkRole('user'), pedidoController.criarPedido);

// Pedidos do usuário logado
router.get('/meus', verificarToken, checkRole('user'), pedidoController.listarPedidosUsuario);

// Vendas por produto (admin)
router.get('/admin/vendas', verificarToken, checkRole('admin'), pedidoController.listarVendasAdmin);

router.patch('/admin/:id/status', verificarToken, checkRole('admin'), pedidoController.atualizarStatusPedido);

module.exports = router;
