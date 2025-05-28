const Mensagem = require('../models/Mensagem');
const admin = require('../config/firebaseAdmin');


const criarMensagem = async (senderId, receiverId, conteudo) => {
  const nova = await Mensagem.create({ senderId, receiverId, conteudo });
  // 🔄 Envia para o Firebase Realtime DB
  const db = admin.database();
  const ref = db.ref(`mensagens/${receiverId}`);
  const novaRef = ref.push();

  await novaRef.set({
    senderId,
    conteudo,
    timestamp: Date.now(),
    lida: false
  });

  return nova;
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

const buscarNaoLidas = async (receiverId) => {
  return await Mensagem.find({
    receiverId,
    lida: false
  }).sort({ dataEnvio: -1 });
};


module.exports = {
  criarMensagem,
  listarConversas,
  buscarNaoLidas
};
