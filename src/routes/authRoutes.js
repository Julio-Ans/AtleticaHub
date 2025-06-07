const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const AuthController = require('../controllers/authController');

// --- Rotas públicas de autenticação ---
router.post('/register', AuthController.register); // API externa (Next.js)
router.post('/login', AuthController.login);
router.post('/verify', AuthController.verify);
router.post('/profile', AuthController.profile);
router.put('/update-profile', AuthController.updateProfile);
router.post('/logout', AuthController.logout);

// --- Rotas protegidas ---
router.get('/verify-user', verificarToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      uid: req.user.uid,
      nome: req.user.nome,
      role: req.user.role
    }
  });
});

router.get('/verify-admin', verificarToken, checkRole('admin'), (req, res) => {
  res.json({
    authenticated: true,
    admin: true,
    user: {
      uid: req.user.uid,
      nome: req.user.nome,
      role: req.user.role
    }
  });
});

// Rota para promover usuário a admin
router.patch('/promote/:userId', verificarToken, checkRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await require('../services/authService').promoteUserToAdmin(userId);
    res.json({
      message: 'Usuário promovido para administrador com sucesso',
      user: result
    });
  } catch (err) {
    console.error('Erro ao promover usuário:', err);
    if (err.message.includes('não encontrado')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao promover usuário: ' + err.message });
  }
});

module.exports = router;
