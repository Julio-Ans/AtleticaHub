const eventoRepository = require('../repositories/eventoRepository');

class EventoService {
  async listarEventos() {
    try {
      return await eventoRepository.findAll();
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      throw new Error('Falha ao listar eventos');
    }
  }

  async buscarEventoPorId(id) {
    try {
      const evento = await eventoRepository.findById(id);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }
      return evento;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    }
  }

  async criarEvento(eventoData) {
    try {
      // Validações de negócio
      if (!eventoData.titulo || !eventoData.data || !eventoData.local) {
        throw new Error('Título, data e local são obrigatórios');
      }

      // Verificar se a data é futura
      if (new Date(eventoData.data) < new Date()) {
        throw new Error('A data do evento deve ser futura');
      }

      return await eventoRepository.create(eventoData);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async atualizarEvento(id, updateData) {
    try {
      // Verificar se o evento existe
      const evento = await eventoRepository.findById(id);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      // Validações se a data foi alterada
      if (updateData.data && new Date(updateData.data) < new Date()) {
        throw new Error('A data do evento deve ser futura');
      }

      return await eventoRepository.update(id, updateData);
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  async excluirEvento(id) {
    try {
      const evento = await eventoRepository.findById(id);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      return await eventoRepository.delete(id);
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }
  }

  async inscreverUsuario(eventoId, usuarioData) {
    try {
      const evento = await eventoRepository.findById(eventoId);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      // Verificar se o usuário já está inscrito
      const jaInscrito = evento.inscricoes.some(
        inscricao => inscricao.usuarioId === usuarioData.usuarioId
      );

      if (jaInscrito) {
        throw new Error('Usuário já está inscrito neste evento');
      }

      // Verificar se o evento já passou
      if (new Date(evento.data) < new Date()) {
        throw new Error('Não é possível se inscrever em evento que já passou');
      }

      const inscricaoData = {
        ...usuarioData,
        dataInscricao: new Date()
      };

      return await eventoRepository.addInscricao(eventoId, inscricaoData);
    } catch (error) {
      console.error('Erro ao inscrever usuário:', error);
      throw error;
    }
  }

  async cancelarInscricao(eventoId, usuarioId) {
    try {
      const evento = await eventoRepository.findById(eventoId);
      if (!evento) {
        throw new Error('Evento não encontrado');
      }

      const inscricao = evento.inscricoes.find(
        inscricao => inscricao.usuarioId === usuarioId
      );

      if (!inscricao) {
        throw new Error('Usuário não está inscrito neste evento');
      }

      return await eventoRepository.removeInscricao(eventoId, usuarioId);
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      throw error;
    }
  }

  async listarEventosDoUsuario(usuarioId) {
    try {
      return await eventoRepository.findEventosWithUserInscricao(usuarioId);
    } catch (error) {
      console.error('Erro ao listar eventos do usuário:', error);
      throw new Error('Falha ao listar seus eventos');
    }
  }

  async listarEventosPorTipo(tipo) {
    try {
      return await eventoRepository.findByType(tipo);
    } catch (error) {
      console.error('Erro ao listar eventos por tipo:', error);
      throw new Error('Falha ao listar eventos por tipo');
    }
  }

  async listarEventosProximos() {
    try {
      return await eventoRepository.findUpcoming();
    } catch (error) {
      console.error('Erro ao listar eventos próximos:', error);
      throw new Error('Falha ao listar eventos próximos');
    }
  }
}

module.exports = new EventoService();
