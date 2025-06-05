const mensagemRepository = require('../repositories/mensagemRepository');

async function criarMensagem({ conteudo, usuarioId, usuarioNome, esporteId }) {
  try {
    // Validações de negócio
    if (!conteudo || conteudo.trim() === '') {
      throw new Error('Conteúdo da mensagem é obrigatório');
    }

    if (!usuarioId || !usuarioNome || !esporteId) {
      throw new Error('Dados do usuário e esporte são obrigatórios');
    }

    const mensagemData = {
      conteudo: conteudo.trim(),
      usuarioId,
      usuarioNome,
      esporteId
    };

    return await mensagemRepository.create(mensagemData);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    throw error;
  }
}

async function listarMensagens(esporteId) {
  try {
    if (!esporteId) {
      throw new Error('ID do esporte é obrigatório');
    }

    return await mensagemRepository.findBySport(esporteId);
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    throw new Error('Falha ao listar mensagens');
  }
}

async function editarMensagem(id, usuarioId, conteudo) {
  try {
    if (!conteudo || conteudo.trim() === '') {
      throw new Error('Conteúdo da mensagem é obrigatório');
    }

    const mensagem = await mensagemRepository.findById(id);
    if (!mensagem) {
      throw new Error('Mensagem não encontrada');
    }

    // Verificar se o usuário é o autor da mensagem
    if (mensagem.usuarioId !== usuarioId) {
      throw new Error('Você só pode editar suas próprias mensagens');
    }

    return await mensagemRepository.update(id, { 
      conteudo: conteudo.trim() 
    });
  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    throw error;
  }
}

async function excluirMensagem(id, usuarioId, isAdmin) {
  try {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    const mensagem = await mensagemRepository.findById(id);
    if (!mensagem) {
      throw new Error('Mensagem não encontrada');
    }

    // Verificar se é o autor ou admin
    if (mensagem.usuarioId !== usuarioId && !isAdmin) {
      throw new Error('Você não tem permissão para excluir esta mensagem');
    }

    await mensagemRepository.delete(id);
    return true;
  } catch (error) {
    console.error('Erro ao excluir mensagem:', error);
    throw error;
  }
}

async function fixarMensagem(id, fixar) {
  try {
    if (!id) {
      throw new Error('ID da mensagem é obrigatório');
    }

    const mensagem = await mensagemRepository.findById(id);
    if (!mensagem) {
      throw new Error('Mensagem não encontrada');
    }

    return await mensagemRepository.updatePinStatus(id, fixar);
  } catch (error) {
    console.error('Erro ao fixar/desfixar mensagem:', error);
    throw error;
  }
}

module.exports = {
  criarMensagem,
  listarMensagens,
  editarMensagem,
  excluirMensagem,
  fixarMensagem
};
