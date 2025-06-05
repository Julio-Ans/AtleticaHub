const inscricaoRepository = require('../repositories/inscricaoRepository');
const esporteRepository = require('../repositories/esporteRepository');

module.exports = {
  async criarInscricao(usuarioId, esporteId) {
    try {
      // Validações
      if (esporteId === "0") {
        throw new Error('Não é possível se inscrever no grupo Geral');
      }
      
      // Verificar se o esporte existe
      const esporte = await esporteRepository.findById(String(esporteId));
      if (!esporte) {
        throw new Error('Esporte não encontrado');
      }
        // Verificar se já existe inscrição
      const inscricaoExistente = await inscricaoRepository.findByUserAndSport(
        usuarioId, 
        String(esporteId)
      );
      
      if (inscricaoExistente) {
        if (inscricaoExistente.status === 'aceito') {
          throw new Error('Você já está inscrito neste esporte');
        } else if (inscricaoExistente.status === 'pendente') {
          // Retornar a inscrição existente em vez de lançar um erro
          return inscricaoExistente;
        } else if (inscricaoExistente.status === 'recusado') {
          // Atualizar status para pendente se foi recusada anteriormente
          return await inscricaoRepository.update(inscricaoExistente.id, { status: 'pendente' });
        }
      }
      
      return await inscricaoRepository.create({
        usuarioId,
        esporteId: String(esporteId),
        status: 'pendente'
      });
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      throw error;
    }
  },
  
  async listarPendentes(esporteId) {
    try {
      return await inscricaoRepository.findPendingBySport(String(esporteId));
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
      const inscricao = await inscricaoRepository.findById(id);
      if (!inscricao) {
        throw new Error('Inscrição não encontrada');
      }
      
      return await inscricaoRepository.updateStatus(id, status);
    } catch (error) {
      console.error('Erro ao atualizar status da inscrição:', error);
      throw error;
    }
  },

  async listarPorUsuario(usuarioId) {
    try {
      return await inscricaoRepository.findByUser(usuarioId);
    } catch (error) {
      console.error('Erro ao listar inscrições do usuário:', error);
      throw new Error('Falha ao listar suas inscrições');
    }
  }
};
