const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const authService = require('../services/authService');
const adminService = require('../services/adminService');
const authController = require('../controllers/authController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {admin} = require('../config/firebaseAdmin');

// Atualizar o endpoint de login
router.post('/login', authController.loginUser);
router.post('/login', authController.loginUser);

// Rota de registro com a lógica corrigida
router.post('/register', authController.registerUser);
router.post('/register', authController.registerUser);

// Rotas existentes
router.get('/verify-user', verificarToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
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
      email: req.user.email,
      nome: req.user.nome
    }
  });
});

// Adicionar nova rota:

// Rotas existentes
router.get('/verify-user', verificarToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
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
      email: req.user.email,
      nome: req.user.nome
    }
  });
});

// Rotas existentes
router.get('/verify-user', verificarToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
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
      email: req.user.email,
      nome: req.user.nome
    }
  });
});

// Rota para promover um usuário existente a administrador
router.patch('/promote/:userId', verificarToken, checkRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await authService.promoteUserToAdmin(userId);
    const result = await authService.promoteUserToAdmin(userId);
    
    res.json({
      message: 'Usuário promovido para administrador com sucesso',
      user: result
      user: result
    });
  } catch (err) {
    console.error('Erro ao promover usuário:', err);
    if (err.message.includes('não encontrado')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('não encontrado')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erro ao promover usuário: ' + err.message });
  }
});

module.exports = router;
