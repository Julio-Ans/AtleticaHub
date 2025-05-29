const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const inscricaoController = require('../controllers/inscricaoController');

// Usar verificarToken em todas as rotas
router.use(verificarToken);

// CORRIGIDO: Certifique-se de que o método existe no controller
router.get('/minhas', inscricaoController.listarMinhasInscricoes);

// Outras rotas
router.post('/:esporteId', inscricaoController.criarInscricao);
router.get('/pendentes/:esporteId', checkRole('admin'), inscricaoController.listarPendentes);
router.put('/:id', checkRole('admin'), inscricaoController.atualizarStatus);

module.exports = router;
