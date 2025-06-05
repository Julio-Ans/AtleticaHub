const { admin } = require('../config/firebaseAdmin');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const usuario = await prisma.usuario.findUnique({
      where: { id: decodedToken.uid }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado no banco.' });
    }

    req.usuario = usuario; // passa tudo: id, nome, email, role, etc.
    req.user = { // mantém compatibilidade
      uid: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role
    };

    next();
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = verificarToken;
