const { admin } = require('../config/firebaseAdmin');
const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');

class AuthController {
  /**
   * Registrar novo usuário via API
   */
  static async register(req, res) {
    try {
      const { email, password, nome, telefone, curso, dataNascimento, codigo } = req.body;

      // Validar campos obrigatórios
      const requiredFields = ['email', 'password', 'nome', 'telefone', 'curso', 'dataNascimento'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios ausentes',
          missingFields
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de email inválido'
        });
      }

      // Validar senha
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      // Verificar domínio do email
      const domain = email.split('@')[1];
      const isDomainAllowed = await authService.checkEmailDomain(email);
      if (!isDomainAllowed) {
        return res.status(403).json({
          success: false,
          error: `Domínio "${domain}" não é autorizado`,
          message: 'Apenas emails institucionais são permitidos'
        });
      }
      
      // Processar código de convite
      let role = 'user';
      if (codigo) {
        const invite = await authService.verifyInviteCode(codigo);
        if (invite) {
          role = invite.role;
          await authService.markInviteCodeAsUsed(invite.id);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Código de convite inválido ou já utilizado'
          });
        }
      }

      // Registrar no Firebase
      const firebaseUser = await authService.registerUserInFirebase(email, password);

      // Validar data de nascimento
      const dataNascimentoObj = new Date(dataNascimento);
      if (isNaN(dataNascimentoObj.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Data de nascimento inválida'        });
      }
      
      // Salvar no banco
      const usuario = await userRepository.create({
        id: firebaseUser.uid,
        nome,
        telefone,
        curso,
        dataNascimento: dataNascimentoObj,
        role
      });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        user: {
          uid: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          role: usuario.role,
          telefone: usuario.telefone,
          curso: usuario.curso
        }
      });    } catch (error) {
      console.error('Erro no registro:', error);
      return AuthController.handleError(res, error);
    }
  }

  /**
   * Login via API
   */
  static async login(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'Token de autenticação é obrigatório'
        });
      }      // Verificar token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      // Buscar usuário
      let usuario = await userRepository.findById(uid);

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
          
          console.log(`Usuário criado automaticamente no login: ${usuario.nome} (${usuario.id})`);
        } catch (createErr) {
          console.error('Erro ao criar usuário no banco durante login:', createErr);
          return res.status(500).json({
            success: false,
            error: 'Erro ao criar usuário no sistema.'
          });        }
      }

      // DEBUG: Log para verificar dados do usuário
      console.log('🔍 DEBUG Login - Dados do usuário:', {
        id: usuario.id,
        nome: usuario.nome,
        role: usuario.role
      });

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        user: usuario,
        role: usuario.role // Adicionar role diretamente para o frontend
      });} catch (error) {
      console.error('Erro no login:', error);
      return AuthController.handleError(res, error);
    }
  }

  /**
   * Verificar token
   */
  static async verify(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'Token é obrigatório'
        });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      res.status(200).json({
        success: true,
        message: 'Token válido',
        uid: decodedToken.uid,
        email: decodedToken.email
      });

    } catch (error) {
      console.error('Erro na verificação:', error);
      
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }
  }

  /**
   * Obter perfil do usuário
   */
  static async profile(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'Token é obrigatório'
        });
      }      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      const usuario = await userRepository.findById(uid);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        user: usuario
      });    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return AuthController.handleError(res, error);
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(req, res) {
    try {
      const { idToken, nome, telefone, curso } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'Token é obrigatório'
        });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Preparar dados para atualização
      const updateData = {};
      if (nome) updateData.nome = nome;
      if (telefone) updateData.telefone = telefone;
      if (curso) updateData.curso = curso;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar foi fornecido'
        });
      }
      
      const usuario = await userRepository.update(uid, updateData);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        user: usuario
      });    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return AuthController.handleError(res, error);
    }
  }

  /**
   * Logout (invalidar sessão no cliente)
   */
  static async logout(req, res) {
    try {
      // O logout no Firebase é feito no lado do cliente
      // Aqui podemos apenas confirmar que o processo foi bem-sucedido
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Tratar erros de autenticação
   */
  static handleError(res, error) {
    // Erros específicos do Firebase
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({
        success: false,
        error: 'Este email já está sendo usado por outra conta'
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        error: 'Senha muito fraca. Use pelo menos 6 caracteres'
      });
    }

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Faça login novamente'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Erro genérico
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = AuthController;
