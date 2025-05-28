const { PrismaClient } = require('@prisma/client');
const admin = require('../config/firebaseAdmin');

const prisma = new PrismaClient();

async function checkEmailDomain(email) {
  const domain = email.split('@')[1];
  const domainAllowed = await prisma.emailDomain.findUnique({ where: { domain } });
  return domainAllowed !== null;  // Retorna verdadeiro se o domínio for permitido
}

async function verifyInviteCode(codigo) {
  const invite = await prisma.inviteCode.findUnique({ where: { code: codigo } });
  if (!invite || invite.used) {
    return null; // Código inválido ou já utilizado
  }
  return invite;
}


async function registerUserInFirebase(email, password) {
  try {
    let userRecord = null;

    // Tente encontrar o usuário com esse email
    try {
      userRecord = await admin.auth().getUserByEmail(email); // Tenta buscar o usuário pelo email
      console.log(`Usuário encontrado: ${email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Se o usuário não for encontrado, continue para criar um novo
        console.log('Usuário não encontrado, criando novo usuário.');
      } else {
        // Erro diferente de 'user-not-found', relance o erro
        throw new Error('Erro ao verificar o email: ' + err.message);
      }
    }

    if (!userRecord) {
      // Se o usuário não existe, cria um novo
      console.log('Criando novo usuário no Firebase...');
      const userCredential = await admin.auth().createUser({
        email,
        password,
      });
      console.log('Usuário criado com sucesso:', userCredential);
      return userCredential;
    }

    // Caso o usuário já exista, retorne a informação do usuário
    return userRecord; // Usuário já existente

  } catch (err) {
    console.error('Erro ao registrar usuário no Firebase:', err);
    throw new Error('Erro ao registrar usuário no Firebase: ' + err.message);
  }
}

async function registerUserService({ uid, email, nome, telefone, curso, dataNascimento, role }) {
  // Criar o usuário no banco de dados (PostgreSQL)
  const usuario = await prisma.usuario.create({
    data: {
      id: uid,
      nome,
      telefone,
      curso,
      dataNascimento: new Date(dataNascimento),
      role,  // Atribuir o papel do usuário
    },
  });

  return usuario;
}

async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

async function getUsuario(uid) {
  return await prisma.usuario.findUnique({ where: { id: uid } });
}

module.exports = {
  checkEmailDomain,
  verifyInviteCode,
  registerUserService,
  verifyIdToken,
  getUsuario,
  registerUserInFirebase
};
