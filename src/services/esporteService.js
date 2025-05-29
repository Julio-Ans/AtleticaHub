const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async listarEsportes() {
    try {
      const esportes = await prisma.esporte.findMany();
      
      // Adicionar o esporte "Geral" se não existir no banco
      const temGeral = esportes.some(e => e.id === "0");
      if (!temGeral) {
        esportes.unshift({ id: "0", nome: "Geral" });
      }
      
      return esportes;
    } catch (error) {
      console.error('Erro ao listar esportes:', error);
      throw new Error('Falha ao listar esportes');
    }
  },

  async criarEsporte(nome) {
    try {
      // Validações de negócio
      if (!nome || nome.trim() === '') {
        throw new Error('Nome do esporte é obrigatório');
      }
      
      // Verificar se já existe
      const esporteExistente = await prisma.esporte.findFirst({
        where: { nome: { equals: nome, mode: 'insensitive' } }
      });
      
      if (esporteExistente) {
        throw new Error('Já existe um esporte com este nome');
      }
      
      return await prisma.esporte.create({
        data: { nome }
      });
    } catch (error) {
      console.error('Erro ao criar esporte:', error);
      throw error;
    }
  },

  async atualizarEsporte(id, nome) {
    try {
      // Validações
      if (!nome || nome.trim() === '') {
        throw new Error('Nome do esporte é obrigatório');
      }
      
      // Verificar se o esporte existe
      const esporte = await prisma.esporte.findUnique({
        where: { id: String(id) }
      });
      
      if (!esporte) {
        throw new Error('Esporte não encontrado');
      }
      
      // Verificar se o novo nome já existe em outro esporte
      const esporteExistente = await prisma.esporte.findFirst({
        where: { 
          nome: { equals: nome, mode: 'insensitive' },
          id: { not: String(id) }
        }
      });
      
      if (esporteExistente) {
        throw new Error('Já existe outro esporte com este nome');
      }
      
      return await prisma.esporte.update({
        where: { id: String(id) },
        data: { nome }
      });
    } catch (error) {
      console.error('Erro ao atualizar esporte:', error);
      throw error;
    }
  },

  async excluirEsporte(id) {
    try {
      // Validações
      if (id === "0") {
        throw new Error('O esporte Geral não pode ser excluído');
      }
      
      // Verificar se existem inscrições para este esporte
      const inscricoes = await prisma.inscricao.findFirst({
        where: { esporteId: String(id) }
      });
      
      if (inscricoes) {
        throw new Error('Não é possível excluir um esporte com inscrições ativas');
      }
      
      return await prisma.esporte.delete({
        where: { id: String(id) }
      });
    } catch (error) {
      console.error('Erro ao excluir esporte:', error);
      throw error;
    }
  }
};