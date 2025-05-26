const express = require('express');
const router = express.Router();
const mensagemController = require('../controllers/mensagemController');
const verificarToken = require('../middlewares/verificarToken');

// Enviar mensagem
router.post('/', verificarToken, mensagemController.enviarMensagem);

// Buscar mensagens entre o usuário logado e outro
router.get('/:receiverId', verificarToken, mensagemController.listarMensagens);


module.exports = router;
