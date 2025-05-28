const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware: Verifica papel do usuário consultando o banco pelo UID
function checkRole(requiredRole) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Busca usuário pelo UID do Firebase (que é o campo `id` no Prisma)
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.uid }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (usuario.role !== requiredRole) {
        return res.status(403).json({ error: 'Acesso negado: Permissão insuficiente' });
      }

      // Armazena o usuário completo no req para uso futuro
      req.usuario = usuario;

      next();
    } catch (error) {
      console.error('Erro no middleware checkRole:', error);
      res.status(500).json({ error: 'Erro ao verificar papel do usuário' });
    }
  };
}

module.exports = checkRole;
