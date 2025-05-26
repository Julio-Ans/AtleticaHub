// src/routes/authRoutes.js
const express = require('express');
const admin = require('../config/firebaseAdmin');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Cadastrar usuário (email/senha + validações)
router.post('/register', async (req, res) => {
  const { email, password, codigo } = req.body;

  // 1) Verifica domínio permitido no banco
  const domain = email.split('@')[1];
  const domainAllowed = await prisma.emailDomain.findUnique({
    where: { domain }
  });
  if (!domainAllowed) {
    return res.status(400).json({
      error: `Domínio "${domain}" não autorizado.`
    });
  }

  // 2) Verifica código de convite (opcional) e role
  let role = 'user';
  const code = codigo?.value || '';

  if (code) {
    const invite = await prisma.inviteCode.findUnique({
      where: { code }
    });
    if (!invite) {
      return res.status(400).json({ error: 'Código de convite inválido.' });
    }
    if (invite.used) {
      return res.status(400).json({ error: 'Código de convite já utilizado.' });
    }
    // Se código válido, pega o role e marca como usado
    role = invite.role;
    await prisma.inviteCode.update({
      where: { code },
      data: { used: true }
    });
  }

  try {
    // 3) Cria usuário no Firebase
    const userRecord = await admin.auth().createUser({ email, password });

    // 4) Define custom claim de role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // 5) Responde com dados e role
    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      role
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login com Firebase ID Token
router.post('/login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decoded.uid);
    const role = decoded.role || 'user';

    res.json({
      uid: user.uid,
      email: user.email,
      role
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

module.exports = router;
