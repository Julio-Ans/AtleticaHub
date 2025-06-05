const Mensagem = require('../models/mensagem.model');

class MensagemRepository {
  async findAll() {
    return await Mensagem.find().sort({ criadaEm: -1 });
  }

  async findById(id) {
    return await Mensagem.findById(id);
  }

  async create(mensagemData) {
    const mensagem = new Mensagem(mensagemData);
    return await mensagem.save();
  }

  async update(id, updateData) {
    return await Mensagem.findByIdAndUpdate(
      id, 
      { ...updateData, editadaEm: new Date() }, 
      { new: true }
    );
  }

  async delete(id) {
    return await Mensagem.findByIdAndDelete(id);
  }

  async findBySport(esporteId) {
    return await Mensagem.find({ esporteId })
      .sort({ fixada: -1, criadaEm: -1 });
  }

  async findByUser(usuarioId) {
    return await Mensagem.find({ usuarioId })
      .sort({ criadaEm: -1 });
  }

  async findPinned(esporteId) {
    return await Mensagem.find({
      esporteId,
      fixada: true
    }).sort({ criadaEm: -1 });
  }

  async updatePinStatus(id, fixada) {
    return await Mensagem.findByIdAndUpdate(
      id,
      { fixada, editadaEm: new Date() },
      { new: true }
    );
  }

  async findRecent(limit = 10) {
    return await Mensagem.find()
      .sort({ criadaEm: -1 })
      .limit(limit);
  }

  async countBySport(esporteId) {
    return await Mensagem.countDocuments({ esporteId });
  }
}

module.exports = new MensagemRepository();
