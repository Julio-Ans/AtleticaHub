const Evento = require('../models/evento.model');

class EventInscricaoRepository {
  async findByUserAndEvent(usuarioId, eventId) {
    const evento = await Evento.findById(eventId);
    if (!evento) return null;
    
    return evento.inscricoes.find(inscricao => inscricao.usuarioId === usuarioId);
  }

  async create(data) {
    const { usuarioId, eventId, nome, email } = data;
    
    const evento = await Evento.findByIdAndUpdate(
      eventId,
      {
        $push: {
          inscricoes: {
            usuarioId,
            nome,
            email,
            dataInscricao: new Date()
          }
        }
      },
      { new: true }
    );
    
    return evento.inscricoes[evento.inscricoes.length - 1];
  }

  async deleteByUserAndEvent(usuarioId, eventId) {
    return await Evento.findByIdAndUpdate(
      eventId,
      {
        $pull: {
          inscricoes: { usuarioId }
        }
      },
      { new: true }
    );
  }

  async findByUser(usuarioId) {
    const eventos = await Evento.find({
      'inscricoes.usuarioId': usuarioId
    });
    
    return eventos.map(evento => ({
      evento: {
        _id: evento._id,
        titulo: evento.titulo,
        descricao: evento.descricao,
        tipo: evento.tipo,
        data: evento.data,
        local: evento.local
      },
      inscricao: evento.inscricoes.find(inscricao => inscricao.usuarioId === usuarioId)
    }));
  }

  async findByEvent(eventId) {
    const evento = await Evento.findById(eventId);
    return evento ? evento.inscricoes : [];
  }
}

module.exports = new EventInscricaoRepository();
