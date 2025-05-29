const express = require('express');
const router = express.Router();
const mensagemController = require('../controllers/mensagemController');
const verificarToken = require('../middlewares/verificarToken');

// Protege todas as rotas com autenticação
router.use(verificarToken);

// Mensagens por esporte
router.get('/:esporteId', mensagemController.listarMensagens);
router.post('/:esporteId', mensagemController.criarMensagem);

// Editar e excluir
router.put('/:id', mensagemController.editarMensagem);
router.delete('/:id', mensagemController.excluirMensagem);
router.patch('/:id/fixar', mensagemController.fixarMensagem);

module.exports = router;
