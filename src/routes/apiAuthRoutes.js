const express = require('express');
const router = express.Router();
const ApiAuthController = require('../controllers/apiAuthController');

// Rotas de autenticação para API externa (Next.js)
router.post('/register', ApiAuthController.register);
router.post('/login', ApiAuthController.login);
router.post('/verify', ApiAuthController.verify);
router.post('/profile', ApiAuthController.profile);
router.put('/update-profile', ApiAuthController.updateProfile);
router.post('/logout', ApiAuthController.logout);

module.exports = router;
