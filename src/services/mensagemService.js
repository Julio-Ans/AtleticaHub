const Mensagem = require('../models/Mensagem');

const criarMensagem = async (senderId, receiverId, conteudo) => {
  try {
    const nova = await Mensagem.create({
      senderId,
      receiverId,
      conteudo,
      lida: false,
      dataEnvio: new Date()
    });
    console.log('✅ Mensagem salva no MongoDB:', nova);
    return nova;
  } catch (err) {
    console.error('❌ Erro ao salvar mensagem:', err);
    throw err;
  }
};

const listarConversas = async (user1, user2) => {
  try {
    const conversas = await Mensagem.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ dataEnvio: 1 });
    return conversas;
  } catch (err) {
    console.error('❌ Erro ao buscar mensagens:', err);
    throw err;
  }
};

module.exports = {
  criarMensagem,
  listarConversas
};
