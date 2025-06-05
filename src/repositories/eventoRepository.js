const Evento = require('../models/evento.model');

class EventoRepository {
  async findAll() {
    return await Evento.find().sort({ data: 1 });
  }

  async findById(id) {
    return await Evento.findById(id);
  }

  async create(eventoData) {
    const evento = new Evento(eventoData);
    return await evento.save();
  }

  async update(id, updateData) {
    return await Evento.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true }
    );
  }

  async delete(id) {
    return await Evento.findByIdAndDelete(id);
  }

  async findByDateRange(startDate, endDate) {
    return await Evento.find({
      data: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ data: 1 });
  }

  async findByType(tipo) {
    return await Evento.find({ tipo }).sort({ data: 1 });
  }

  async findUpcoming() {
    return await Evento.find({
      data: { $gte: new Date() }
    }).sort({ data: 1 });
  }

  async findByCreator(criadorId) {
    return await Evento.find({ criadorId }).sort({ data: -1 });
  }

  async addInscricao(eventoId, inscricaoData) {
    return await Evento.findByIdAndUpdate(
      eventoId,
      { $push: { inscricoes: inscricaoData } },
      { new: true }
    );
  }

  async removeInscricao(eventoId, usuarioId) {
    return await Evento.findByIdAndUpdate(
      eventoId,
      { $pull: { inscricoes: { usuarioId } } },
      { new: true }
    );
  }

  async findEventosWithUserInscricao(usuarioId) {
    return await Evento.find({
      'inscricoes.usuarioId': usuarioId
    }).sort({ data: 1 });
  }
}

module.exports = new EventoRepository();
