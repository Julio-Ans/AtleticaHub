const admin = require('../config/firebaseAdmin'); 

// Verifica token e adiciona req.user
async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou inválido' });
  }

  const token = authHeader.split(' ')[1]; // Extrai o token do cabeçalho

  try {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verifica o token com Firebase Admin
    req.user = decodedToken; // Adiciona o usuário autenticado em req.user
    next(); // Passa para a próxima função/middleware
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = verificarToken;
