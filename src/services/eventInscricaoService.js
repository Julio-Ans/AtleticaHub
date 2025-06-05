const eventInscricaoRepository = require('../repositories/eventInscricaoRepository');
const userRepository = require('../repositories/userRepository');

class EventInscricaoService {
  async inscreverUsuario(usuarioId, eventId) {
    try {
      // Verificar se já está inscrito
      const jaInscrito = await eventInscricaoRepository.findByUserAndEvent(usuarioId, eventId);
      
      if (jaInscrito) {
        throw new Error('Usuário já inscrito neste evento');
      }
      
      // Buscar dados do usuário para a inscrição
      const usuario = await userRepository.findById(usuarioId);
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      return await eventInscricaoRepository.create({ 
        usuarioId, 
        eventId, 
        nome: usuario.nome, 
        email: usuario.email || '' 
      });
    } catch (error) {
      console.error('Erro ao inscrever usuário em evento:', error);
      throw error;
    }
  }

  async cancelarInscricao(usuarioId, eventId) {
    try {
      const inscricao = await eventInscricaoRepository.findByUserAndEvent(usuarioId, eventId);
      
      if (!inscricao) {
        throw new Error('Inscrição não encontrada');
      }
      
      await eventInscricaoRepository.deleteByUserAndEvent(usuarioId, eventId);
      
      return { message: 'Inscrição cancelada com sucesso' };
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      throw error;
    }
  }

  async listarEventosDoUsuario(usuarioId) {
    try {
      return await eventInscricaoRepository.findByUser(usuarioId);
    } catch (error) {
      console.error('Erro ao listar eventos do usuário:', error);
      throw error;
    }
  }
}

module.exports = new EventInscricaoService();
