const Mensagem = require('../models/mensagem.model');

async function criarMensagem({ conteudo, usuarioId, usuarioNome, esporteId }) {
  return await Mensagem.create({ conteudo, usuarioId, usuarioNome, esporteId });
}

async function listarMensagens(esporteId) {
  return await Mensagem.find({ esporteId }).sort({ fixada: -1, criadaEm: 1 });
}

async function editarMensagem(id, usuarioId, conteudo) {
  const msg = await Mensagem.findById(id);
  if (!msg || msg.usuarioId !== usuarioId) throw new Error('Permissão negada');
  msg.conteudo = conteudo;
  msg.editadaEm = new Date();
  return await msg.save();
}

async function excluirMensagem(id, usuarioId, isAdmin) {
  try {
    console.log("Função excluirMensagem iniciada");
    console.log("ID da mensagem:", id);
    console.log("ID do usuário:", usuarioId);
    console.log("É admin:", isAdmin);

    // Validar ID da mensagem
    if (!id) {
      throw new Error(`ID da mensagem inválido: ${id}`);
    }
    
    // Tenta converter para ObjectId válido se for string
    const mongoose = require('mongoose');
    let objectId;
    
    try {
      // Tenta usar o id diretamente ou converter para ObjectId se for string
      objectId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
      console.log("ObjectId gerado:", objectId);
    } catch (err) {
      console.error("Erro ao converter para ObjectId:", err);
      throw new Error(`ID da mensagem inválido: ${id}. Erro: ${err.message}`);
    }
    
    // Buscar mensagem - usando findOne para maior flexibilidade com IDs
    const mensagem = await Mensagem.findOne({
      $or: [
        { _id: objectId },
        { _id: id.toString() }
      ]
    });
    
    console.log("Mensagem encontrada:", mensagem ? "Sim" : "Não");

    if (!mensagem) {
      throw new Error('Mensagem não encontrada.');
    }

    console.log("ID do autor da mensagem:", mensagem.usuarioId);
    
    // Verificar se é o autor ou admin
    if (mensagem.usuarioId !== usuarioId && !isAdmin) {
      throw new Error('Você não tem permissão para excluir esta mensagem.');
    }

    // Excluir mensagem - usando deleteOne para evitar problemas com o formato do ID
    console.log("Excluindo mensagem com ID:", id);
    const resultado = await Mensagem.deleteOne({ _id: mensagem._id });
    console.log("Resultado da exclusão:", resultado);
    
    return true;
  } catch (err) {
    console.error('Erro ao excluir mensagem:', err);
    throw new Error(`Falha ao excluir mensagem: ${err.message}`);
  }
}

async function fixarMensagem(id, fixar) {
  try {
    console.log("Função fixarMensagem iniciada");
    console.log("ID da mensagem:", id);
    console.log("Fixar:", fixar);
    
    if (!id) {
      throw new Error(`ID da mensagem inválido: ${id}`);
    }
    
    // Tenta converter para ObjectId válido se for string
    const mongoose = require('mongoose');
    let objectId;
    
    try {
      // Tenta usar o id diretamente ou converter para ObjectId se for string
      objectId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
      console.log("ObjectId gerado:", objectId);
    } catch (err) {
      console.error("Erro ao converter para ObjectId:", err);
      throw new Error(`ID da mensagem inválido: ${id}. Erro: ${err.message}`);
    }
    
    // Usando updateOne para maior compatibilidade com diferentes formatos de ID
    const resultado = await Mensagem.findOneAndUpdate(
      { _id: objectId },
      { fixada: fixar },
      { new: true }
    );
    
    console.log("Resultado da operação fixar:", resultado ? "Sucesso" : "Falha");
    
    return resultado;
  } catch (err) {
    console.error("Erro ao fixar/desfixar mensagem:", err);
    throw new Error(`Falha ao atualizar status da mensagem: ${err.message}`);
  }
}

module.exports = {
  criarMensagem,
  listarMensagens,
  editarMensagem,
  excluirMensagem,
  fixarMensagem
};
