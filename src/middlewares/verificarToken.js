const admin = require('../config/firebaseAdmin');
const userRepository = require('../repositories/userRepository');

async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Verifica se o token existe e começa com 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente ou inválido' });
  }

  // Extrai o token
  const token = authHeader.split(' ')[1];

  try {
    // Valida com Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Busca o usuário completo no PostgreSQL usando repository
    const usuario = await userRepository.findById(decodedToken.uid);

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado no banco.' });
    }

    // Preenche os dados que o controller precisa
    req.user = {
      uid: usuario.id,
      nome: usuario.nome,
      role: usuario.role
    };

    // ✅ Chama o próximo middleware ou controller
    next();

  } catch (err) {
    console.error('Erro ao verificar token:', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = verificarToken;
