const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');

// Criar pedido (user)
router.post('/', verificarToken, checkRole('user'), pedidoController.criarPedido);

// Pedidos do usuário logado
router.get('/meus', verificarToken, checkRole('user'), pedidoController.listarPedidosUsuario);

// Buscar pedido por ID (admin ou próprio pedido)
router.get('/:id', verificarToken, pedidoController.buscarPedidoPorId);

// Admin Dashboard - Pedidos recentes
router.get('/admin/recentes', verificarToken, checkRole('admin'), pedidoController.listarPedidosRecentes);

// Admin Dashboard - Estatísticas da loja
router.get('/admin/estatisticas', verificarToken, checkRole('admin'), pedidoController.obterEstatisticasLoja);

// Admin Dashboard - Relatório de vendas por produto
router.get('/admin/relatorio-vendas', verificarToken, checkRole('admin'), pedidoController.obterRelatorioVendas);

// Vendas por produto (admin)
router.get('/admin/vendas', verificarToken, checkRole('admin'), pedidoController.listarVendasAdmin);

// Atualizar status do pedido (admin)
router.patch('/admin/:id/status', verificarToken, checkRole('admin'), pedidoController.atualizarStatusPedido);

// Excluir pedido (admin)
router.delete('/admin/:id', verificarToken, checkRole('admin'), pedidoController.excluirPedido);

module.exports = router;
