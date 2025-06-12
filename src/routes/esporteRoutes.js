const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const esporteController = require('../controllers/esporteController');
const multer = require('multer');

// Configuração do multer para upload de imagens em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Usar verificarToken em todas as rotas
router.use(verificarToken);

// Rotas de esportes - note que os caminhos são relativos a /api/esportes
router.get('/', esporteController.listarEsportes);
router.get('/:id', esporteController.buscarEsportePorId);
router.post('/', checkRole('admin'), upload.single('foto'), esporteController.criarEsporte);
router.put('/:id', checkRole('admin'), upload.single('foto'), esporteController.atualizarEsporte);
router.delete('/:id', checkRole('admin'), esporteController.excluirEsporte);

module.exports = router;