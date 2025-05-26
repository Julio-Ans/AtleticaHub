const admin = require('../config/firebaseAdmin');

module.exports = async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // UID e email disponíveis
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};