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
  }  async criarEvento(eventoData) {
    try {
      console.log('📝 EventoService.criarEvento - Dados recebidos:', eventoData);
      
      // Validações de negócio
      if (!eventoData.titulo || !eventoData.data || !eventoData.local || !eventoData.esporteId) {
        throw new Error('Título, data, local e esporte são obrigatórios');
      }

      // Temporariamente removendo validação de data futura para debug
      // Verificar se a data é futura (dar uma margem de 1 hora para evitar problemas de timezone)
      // const dataEvento = new Date(eventoData.data);
      // const agora = new Date();
      // agora.setHours(agora.getHours() - 1); // Margem de 1 hora
      
      // if (dataEvento < agora) {
      //   console.log('❌ Data do evento:', dataEvento, 'Data atual (com margem):', agora);
      //   throw new Error('A data do evento deve ser futura');
      // }

      console.log('✅ EventoService.criarEvento - Validações passaram, criando evento...');
      
      const resultado = await eventoRepository.create(eventoData);
      console.log('✅ EventoService.criarEvento - Evento criado com sucesso:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ EventoService.criarEvento - Erro:', error);
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
      );      if (jaInscrito) {
        throw new Error('Usuário já está inscrito neste evento');
      }

      // Removida verificação de data - permite inscrição em qualquer evento
      
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
  async listarEventosPorEsporte(esporteId) {
    try {
      return await eventoRepository.findByEsporte(esporteId);
    } catch (error) {
      console.error('Erro ao listar eventos por esporte:', error);
      throw new Error('Falha ao listar eventos por esporte');
    }
  }

  async listarEventosPorEsportes(esportesIds) {
    try {
      return await eventoRepository.findByEsportes(esportesIds);
    } catch (error) {
      console.error('Erro ao listar eventos por esportes:', error);
      throw new Error('Falha ao listar eventos por esportes');
    }
  }
}

module.exports = new EventoService();
