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

    // Busca o usuário completo no PostgreSQL usando repository
    let usuario = await userRepository.findById(decodedToken.uid);

    // Se o usuário não existir no banco, criar automaticamente
    if (!usuario) {
      try {
        // Buscar dados do usuário no Firebase
        const firebaseUser = await admin.auth().getUser(decodedToken.uid);
        
        // Criar usuário no banco com dados mínimos
        usuario = await userRepository.create({
          id: decodedToken.uid,
          nome: firebaseUser.displayName || firebaseUser.email || 'Usuário',
          dataNascimento: new Date('1990-01-01'), // Data padrão
          telefone: firebaseUser.phoneNumber || 'Não informado',
          curso: 'Não informado',
          role: 'user' // Padrão como usuário comum
        });
        
        console.log(`Usuário criado automaticamente no banco: ${usuario.nome} (${usuario.id})`);
      } catch (createErr) {
        console.error('Erro ao criar usuário no banco:', createErr);
        return res.status(500).json({ error: 'Erro ao criar usuário no sistema.' });
      }
    }

    // Preenche os dados que o controller precisa
    req.user = {
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
