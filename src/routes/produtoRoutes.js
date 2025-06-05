const express = require('express');
const produtoController = require('../controllers/produtoController');
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Rota pública para listar produtos
router.get('/', produtoController.list);

// Rota pública para buscar produto por ID
router.get('/:id', produtoController.getById);

// Rotas protegidas (admin apenas)
router.post('/', verificarToken, checkRole('admin'), produtoController.create);
router.put('/:id', verificarToken, checkRole('admin'), produtoController.update);
router.delete('/:id', verificarToken, checkRole('admin'), produtoController.remove);

module.exports = router;
