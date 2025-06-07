const esporteRepository = require('../repositories/esporteRepository');

module.exports = {  async listarEsportes() {
    try {
      const esportes = await esporteRepository.findAll();
      
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
  async criarEsporte(nome, fotoUrl = null) {
    try {
      // Validações de negócio
      if (!nome || nome.trim() === '') {
        throw new Error('Nome do esporte é obrigatório');
      }
        // Verificar se já existe
      const esporteExistente = await esporteRepository.findByName(nome);
      
      if (esporteExistente) {
        throw new Error('Já existe um esporte com este nome');
      }
      
      const data = { nome };
      if (fotoUrl) {
        data.fotoUrl = fotoUrl;
      }
      
      return await esporteRepository.create(data);
    } catch (error) {
      console.error('Erro ao criar esporte:', error);
      throw error;
    }
  },
  async atualizarEsporte(id, nome, fotoUrl = null) {
    try {
      // Validações
      if (!nome || nome.trim() === '') {
        throw new Error('Nome do esporte é obrigatório');
      }
        // Verificar se o esporte existe
      const esporte = await esporteRepository.findById(id);
      
      if (!esporte) {
        throw new Error('Esporte não encontrado');
      }
      
      // Verificar se o novo nome já existe em outro esporte
      const esporteExistente = await esporteRepository.findByName(nome);
      
      if (esporteExistente && esporteExistente.id !== String(id)) {
        throw new Error('Já existe outro esporte com este nome');
      }
      
      const updateData = { nome };
      if (fotoUrl) {
        updateData.fotoUrl = fotoUrl;
      }
      
      return await esporteRepository.update(id, updateData);
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
      const numeroInscricoes = await esporteRepository.countInscricoes(id);
      
      if (numeroInscricoes > 0) {
        throw new Error('Não é possível excluir um esporte com inscrições ativas');
      }
        return await esporteRepository.delete(id);
    } catch (error) {
      console.error('Erro ao excluir esporte:', error);
      throw error;
    }
  }
};