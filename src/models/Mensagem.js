const mongoose = require('mongoose');

const MensagemSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  conteudo: { type: String, required: true },
  lida: { type: Boolean, default: false },
  dataEnvio: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mensagem', MensagemSchema);

