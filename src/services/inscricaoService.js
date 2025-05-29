const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async criarInscricao(usuarioId, esporteId) {
    try {
      // Validações
      if (esporteId === "0") {
        throw new Error('Não é possível se inscrever no grupo Geral');
      }
      
      // Verificar se o esporte existe
      const esporte = await prisma.esporte.findUnique({
        where: { id: String(esporteId) }
      });
      
      if (!esporte) {
        throw new Error('Esporte não encontrado');
      }
      
      // Verificar se já existe inscrição
      const inscricaoExistente = await prisma.inscricao.findFirst({
        where: {
          usuarioId,
          esporteId: String(esporteId)
        }
      });
      
      if (inscricaoExistente) {
        if (inscricaoExistente.status === 'aceito') {
          throw new Error('Você já está inscrito neste esporte');
        } else if (inscricaoExistente.status === 'pendente') {
          throw new Error('Sua inscrição está pendente de aprovação');
        }
      }
      
      return await prisma.inscricao.create({
        data: {
          usuarioId,
          esporteId: String(esporteId),
          status: 'pendente'
        }
      });
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      throw error;
    }
  },
  
  async listarPendentes(esporteId) {
    try {
      return await prisma.inscricao.findMany({
        where: {
          esporteId: String(esporteId),
          status: 'pendente'
        },
        include: {
          usuario: true
        }
      });
    } catch (error) {
      console.error('Erro ao listar inscrições pendentes:', error);
      throw new Error('Falha ao listar inscrições pendentes');
    }
  },
  
  async atualizarStatus(id, status) {
    try {
      // Validações
      if (!['aceito', 'recusado', 'pendente'].includes(status)) {
        throw new Error('Status inválido. Use: aceito, recusado ou pendente');
      }
      
      // Verificar se a inscrição existe
      const inscricao = await prisma.inscricao.findUnique({
        where: { id }
      });
      
      if (!inscricao) {
        throw new Error('Inscrição não encontrada');
      }
      
      return await prisma.inscricao.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      console.error('Erro ao atualizar status da inscrição:', error);
      throw error;
    }
  },

  async listarPorUsuario(usuarioId) {
    try {
      return await prisma.inscricao.findMany({
        where: { usuarioId },
        orderBy: { criadaEm: 'desc' }
      });
    } catch (error) {
      console.error('Erro ao listar inscrições do usuário:', error);
      throw new Error('Falha ao listar suas inscrições');
    }
  }
};
