const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const inscricaoController = require('../controllers/inscricaoController');

// Usar verificarToken em todas as rotas
router.use(verificarToken);

// ROTA DE DEBUG TEMPORÁRIA
router.get('/debug/minhas', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Usuario logado:', req.user);
    const inscricoes = await inscricaoService.listarPorUsuario(req.user.uid);
    console.log('🔍 DEBUG - Inscrições encontradas:', inscricoes);
    res.json({
      usuario: {
        uid: req.user.uid,
        nome: req.user.nome,
        role: req.user.role
      },
      inscricoes: inscricoes
    });
  } catch (error) {
    console.error('❌ DEBUG - Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

// CORRIGIDO: Certifique-se de que o método existe no controller
router.get('/minhas', inscricaoController.listarMinhasInscricoes);

// 🐛 DEBUG: Rota temporária para debug
router.get('/debug', inscricaoController.debugInscricoes);

// Outras rotas
router.post('/:esporteId', inscricaoController.criarInscricao);
router.get('/pendentes/:esporteId', checkRole('admin'), inscricaoController.listarPendentes);
router.put('/:id', checkRole('admin'), inscricaoController.atualizarStatus);

module.exports = router;
