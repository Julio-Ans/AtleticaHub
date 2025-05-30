const authService = require('../services/authService');

async function registerUser(req, res) {
  try {
    const { email, password, nome, telefone, curso, dataNascimento, codigo } = req.body;

    // Verificar se o domínio do email é permitido
    const isDomainAllowed = await authService.checkEmailDomain(email);
    if (!isDomainAllowed) {
      return res.status(400).json({ error: `Domínio "${email.split('@')[1]}" não autorizado.` });
    }

    // Verificar e aplicar o código de convite para definir o papel
    let role = 'user'; // Default role
    if (codigo) {
      const invite = await authService.verifyInviteCode(codigo);
      if (invite) {
        role = invite.role;
      } else {
        return res.status(400).json({ error: 'Código de convite inválido ou já utilizado.' });
      }
    }

    // Registrar ou buscar o usuário no Firebase
    const firebaseUser = await authService.registerUserInFirebase(email, password);

    // Salvar os dados no banco de dados PostgreSQL com Prisma
    const usuario = await authService.registerUserService({
      uid: firebaseUser.uid,
      email,
      nome,
      telefone,
      curso,
      dataNascimento,
      role
    });



    res.status(201).json({ message: 'Cadastro bem-sucedido!', usuario, role });
  } catch (err) {
    console.error('❌ Erro ao registrar:', err);
    res.status(400).json({ error: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Token não fornecido.' });
    }

    const user = await authService.verifyIdToken(idToken);

    // Obter os dados do usuário do banco de dados
    const usuario = await authService.getUsuario(user.uid);

    // Verificar o papel do usuário para redirecionar para o dashboard apropriado
    const role = usuario ? usuario.role : 'user';  // Padrão para 'user' caso o papel não seja encontrado

    res.status(200).json({ message: 'Login bem-sucedido', user, role });
  } catch (err) {
    console.error('❌ Erro ao logar:', err);
    res.status(401).json({ error: err.message });
  }
}

module.exports = {
  registerUser,
  loginUser
};
