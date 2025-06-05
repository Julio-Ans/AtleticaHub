const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  tipo: { type: String, required: true }, // treino, festa, etc
  data: { type: Date, required: true },
  local: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  criadorId: { type: String, required: true }, // UID do admin
  fotoUrl: { type: String }, // URL da imagem ilustrativa
  inscricoes: [{
    usuarioId: { type: String, required: true },
    nome: { type: String },
    email: { type: String },
    dataInscricao: { type: Date, default: Date.now }
  }],
}, { collection: 'eventos' });

module.exports = mongoose.model('Evento', eventoSchema);
