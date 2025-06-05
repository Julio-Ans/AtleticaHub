const admin = require('../config/firebaseAdmin');
const userRepository = require('../repositories/userRepository');

async function checkEmailDomain(email) {
  const domain = email.split('@')[1];
  const domainAllowed = await userRepository.findEmailDomain(domain);
  return domainAllowed !== null;  // Retorna verdadeiro se o domínio for permitido
}

async function verifyInviteCode(codigo) {
  const invite = await userRepository.findInviteCode(codigo);
  if (!invite || invite.used) {
    return null; // Código inválido ou já utilizado
  }
  return invite;
}

async function markInviteCodeAsUsed(inviteId) {
  return await userRepository.markInviteCodeAsUsed(inviteId);
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
  const usuario = await userRepository.create({
    id: uid,
    nome,
    telefone,
    curso,
    dataNascimento: new Date(dataNascimento),
    role,  // Atribuir o papel do usuário
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
  return await userRepository.findByUid(uid);
}

async function loginUser(idToken) {
  try {
    // Verificar o token do Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Buscar ou criar o usuário no banco de dados
    let usuario = await userRepository.findById(uid);
    
    if (!usuario) {
      // Criar novo usuário com campos mínimos necessários
      usuario = await userRepository.create({
        id: uid,
        email: decodedToken.email,
        nome: decodedToken.name || decodedToken.email?.split('@')[0] || "Usuário",
        role: 'user'
      });
    }
    
    // Retornar informações do usuário
    return {
      uid: usuario.id,
      email: decodedToken.email,
      nome: usuario.nome,
      role: usuario.role
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw new Error('Falha na autenticação: ' + error.message);
  }
}

async function promoteUserToAdmin(userId) {
  try {
    // Verificar se o usuário existe
    const usuario = await userRepository.findById(userId);
    
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    // Promover para admin
    const usuarioAtualizado = await userRepository.updateRole(userId, 'admin');
    
    // Inscrever o novo admin em todos os esportes
    const adminService = require('./adminService');
    await adminService.inscreverAdminEmTodosEsportes(userId);
    
    return {
      id: usuarioAtualizado.id,
      nome: usuarioAtualizado.nome,
      role: usuarioAtualizado.role
    };
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    throw error;
  }
}

module.exports = {
  checkEmailDomain,
  verifyInviteCode,
  markInviteCodeAsUsed,
  registerUserService,
  verifyIdToken,
  getUsuario,
  registerUserInFirebase,
  loginUser,
  promoteUserToAdmin
};
