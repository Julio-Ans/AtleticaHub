const express = require('express');
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');

const router = express.Router();

// Verifica se usuário comum tem acesso
router.get('/verify-user', verificarToken, checkRole('user'), (req, res) => {
  res.status(200).json({ access: 'granted' });
});

// Verifica se admin tem acesso
router.get('/verify-admin', verificarToken, checkRole('admin'), (req, res) => {
  res.status(200).json({ access: 'granted' });
});

module.exports = router;
