const userRepository = require('../repositories/userRepository');

// Middleware: Verifica papel do usuário consultando o banco pelo UID
function checkRole(requiredRole) {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (req.usuario.role !== requiredRole) {
        return res.status(403).json({ error: 'Acesso negado: Permissão insuficiente' });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware checkRole:', error);
      res.status(500).json({ error: 'Erro ao verificar papel do usuário' });
    }
  };
}

module.exports = checkRole;
