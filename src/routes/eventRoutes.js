const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const eventoController = require('../controllers/eventoController');
const multer = require('multer');
const path = require('path');

// Configuração do multer para upload de imagens em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Listar todos os eventos (aberto)
router.get('/', eventoController.listar);
// Listar eventos permitidos para o usuário (baseado em suas inscrições em esportes)
router.get('/permitidos', verificarToken, eventoController.listarEventosPermitidos);
// Listar eventos por esporte
router.get('/esporte/:esporteId', eventoController.listarPorEsporte);
// Buscar evento por ID
router.get('/:id', eventoController.buscar);

// CRUD eventos (admin)
router.post('/', verificarToken, checkRole('admin'), upload.single('foto'), eventoController.criar);
router.put('/:id', verificarToken, checkRole('admin'), eventoController.editar);
router.delete('/:id', verificarToken, checkRole('admin'), eventoController.excluir);

// Inscrição em evento (usuário)
router.post('/:id/inscrever', verificarToken, eventoController.inscrever);
router.delete('/:id/inscrever', verificarToken, eventoController.cancelarInscricao);
router.get('/minhas/inscricoes', verificarToken, eventoController.meusEventos);

module.exports = router;
