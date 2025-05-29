const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const esporteController = require('../controllers/esporteController');

// Usar verificarToken em todas as rotas
router.use(verificarToken);

// Rotas de esportes - note que os caminhos são relativos a /api/esportes
router.get('/', esporteController.listarEsportes);
router.post('/', checkRole('admin'), esporteController.criarEsporte);
router.put('/:id', checkRole('admin'), esporteController.atualizarEsporte);
router.delete('/:id', checkRole('admin'), esporteController.excluirEsporte);

module.exports = router;