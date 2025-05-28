const mensagemService = require('../services/mensagemService');

const enviarMensagem = async (req, res) => {
  const senderId = req.user?.uid;
  const { receiverId, conteudo } = req.body;

  // Validação básica
  if (!receiverId || !conteudo) {
    return res.status(400).json({ error: 'Campos receiverId e conteudo são obrigatórios.' });
  }

  console.log('📤 Enviando mensagem de', senderId, 'para', receiverId);

  try {
    const nova = await mensagemService.criarMensagem(senderId, receiverId, conteudo);
    console.log('✅ Mensagem salva:', nova);
    res.status(201).json(nova);
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: err.message });
  }
};

const listarMensagens = async (req, res) => {
  const senderId = req.user?.uid;
  const { receiverId } = req.params;

  if (!receiverId) {
    return res.status(400).json({ error: 'Parâmetro receiverId ausente na URL' });
  }

  console.log(`📥 Buscando mensagens entre ${senderId} e ${receiverId}`);

  try {
    const mensagens = await mensagemService.listarConversas(senderId, receiverId);
    res.json(mensagens);
  } catch (err) {
    console.error('❌ Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens', details: err.message });
  }
};

const listarNaoLidas = async (req, res) => {
  const userId = req.user.uid;

  try {
    const mensagens = await mensagemService.buscarNaoLidas(userId);
    res.json(mensagens);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar mensagens não lidas', details: err.message });
  }
};


module.exports = {
  enviarMensagem,
  listarMensagens,
  listarNaoLidas

};
