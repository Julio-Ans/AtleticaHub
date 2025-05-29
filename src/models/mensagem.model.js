const mongoose = require('mongoose');

const mensagemSchema = new mongoose.Schema({
  conteudo: { type: String, required: true },
  usuarioId: { type: String, required: true },
  usuarioNome: { type: String, required: true },
  esporteId: { type: String, required: true },
  fixada: { type: Boolean, default: false },
  criadaEm: { type: Date, default: Date.now },
  editadaEm: { type: Date },
}, { collection: 'mensagens' });

module.exports = mongoose.model('Mensagem', mensagemSchema);
