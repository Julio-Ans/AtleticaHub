const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(verificarToken);

// Listar pedidos do usuário
router.get('/', pedidoController.list);

// Buscar pedido por ID
router.get('/:id', pedidoController.getById);

// Processar pagamento
router.post('/:id/payment', pedidoController.pay);

// Cancelar pedido
router.post('/:id/cancel', pedidoController.cancel);

// Rota admin para listar todos os pedidos
router.get('/admin/all', checkRole('admin'), pedidoController.listAll);

module.exports = router;
