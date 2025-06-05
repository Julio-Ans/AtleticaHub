const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const checkRole = require('../middlewares/checkRole');
const authService = require('../services/authService');
const adminService = require('../services/adminService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {admin} = require('../config/firebaseAdmin');

// Atualizar o endpoint de login
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }
    
    // Verificar o token do Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Buscar ou criar o usuário no banco de dados
    let usuario = await prisma.usuario.findUnique({
      where: { id: uid }
    });
    
    if (!usuario) {
      // Criar novo usuário com campos mínimos necessários
      usuario = await prisma.usuario.create({
        data: {
          id: uid,
          email: decodedToken.email,
          nome: decodedToken.name || decodedToken.email?.split('@')[0] || "Usuário",
          role: 'user'
        }
      });
    }
    
    // Retornar informações do usuário
    res.json({
      uid: usuario.id,
      email: decodedToken.email,
      nome: usuario.nome,
      role: usuario.role
    });
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(401).json({ error: 'Falha na autenticação: ' + err.message });
  }
});

// Rota de registro com a lógica corrigida

router.post('/register', async (req, res) => {
  try {
    const { email, password, nome, dataNascimento, telefone, curso, codigo } = req.body;
    
    // Validar campos obrigatórios
    if (!email || !password || !nome || !dataNascimento || !telefone || !curso) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // 1. PRIMEIRA VERIFICAÇÃO: O email DEVE ter domínio permitido
    const dominioPermitido = await authService.checkEmailDomain(email);
    
    if (!dominioPermitido) {
      return res.status(403).json({ 
        error: 'Seu email não pertence a um domínio autorizado. Apenas emails institucionais são permitidos.' 
      });
    }
    
    // 2. APÓS CONFIRMAR DOMÍNIO: Verificar código de convite (se fornecido)
    let role = 'user'; // Papel padrão
    
    if (codigo) {
      const codigoValido = await authService.verifyInviteCode(codigo);
      
      if (codigoValido) {
        role = codigoValido.role; // Usar o papel definido no código (admin ou user)
        
        // Marcar código como usado
        await prisma.inviteCode.update({
          where: { id: codigoValido.id },
          data: { used: true }
        });
      }
      // Se o código não for válido, mantém o papel como 'user'
    }
    
    // 3. Só depois de todas as verificações: Registrar no Firebase
    const userRecord = await authService.registerUserInFirebase(email, password);
    
    // Converter a data de nascimento para o formato adequado
    const dataNascimentoObj = new Date(dataNascimento);
    if (isNaN(dataNascimentoObj.getTime())) {
      return res.status(400).json({ error: 'Data de nascimento inválida' });
    }
    
    // 4. Criar o usuário no banco de dados
    const usuario = await prisma.usuario.create({
      data: {
        id: userRecord.uid,
        nome,
        dataNascimento: dataNascimentoObj,
        telefone,
        curso,
        role
      }
    });
    
    // Se o usuário for admin, inscrever em todos os esportes
    if (usuario.role === 'admin') {
      await adminService.inscreverAdminEmTodosEsportes(usuario.id);
    }
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        uid: usuario.id,
        nome: usuario.nome,
        role: usuario.role
      }
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    
    if (err.code === 'auth/email-already-in-use') {
      return res.status(400).json({ error: 'Este email já está em uso' });
    } else if (err.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Email inválido' });
    } else if (err.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Senha muito fraca. Use pelo menos 6 caracteres' });
    }
    
    res.status(500).json({ error: 'Erro ao registrar usuário: ' + err.message });
  }
});

// Rotas existentes
router.get('/verify-user', verificarToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      nome: req.user.nome,
      role: req.user.role
    }
  });
});

router.get('/verify-admin', verificarToken, checkRole('admin'), (req, res) => {
  res.json({
    authenticated: true,
    admin: true,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      nome: req.user.nome
    }
  });
});

// Adicionar nova rota:

// Rota para promover um usuário existente a administrador
router.patch('/promote/:userId', verificarToken, checkRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });
    
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Promover para admin
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: userId },
      data: { role: 'admin' }
    });
    
    // Inscrever o novo admin em todos os esportes
    await adminService.inscreverAdminEmTodosEsportes(userId);
    
    res.json({
      message: 'Usuário promovido para administrador com sucesso',
      user: {
        id: usuarioAtualizado.id,
        nome: usuarioAtualizado.nome,
        role: usuarioAtualizado.role
      }
    });
  } catch (err) {
    console.error('Erro ao promover usuário:', err);
    res.status(500).json({ error: 'Erro ao promover usuário: ' + err.message });
  }
});

module.exports = router;
