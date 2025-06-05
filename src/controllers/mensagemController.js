const mensagemService = require('../services/mensagemService');
const esporteService = require('../services/esporteService');
const inscricaoService = require('../services/inscricaoService');

// 🔐 Verifica se o usuário tem permissão para acessar o grupo de esporte
async function verificarPermissao(req, esporteId) {
  // Garantir que o esporteId seja uma string
  const esporteIdStr = String(esporteId);
  
  // Acesso livre ao grupo "Geral"
  if (esporteIdStr === "0") return;

  // Admin tem acesso irrestrito
  if (req.user.role === 'admin') return;

  try {
    // Verifica se o esporte existe
    const esporte = await esporteService.buscarEsportePorId(esporteIdStr);
    if (!esporte) {
      throw new Error('Esporte não encontrado.');
    }
  } catch (error) {
    throw new Error('Esporte não encontrado.');
  }

  // Verifica se o usuário tem inscrição aceita no esporte
  const inscricoes = await inscricaoService.listarPorUsuario(req.user.uid);
  const inscricaoAceita = inscricoes.find(
    inscricao => inscricao.esporteId === esporteIdStr && inscricao.status === 'aceito'
  );

  if (!inscricaoAceita) {
    throw new Error('Acesso negado: você não está inscrito neste esporte.');
  }
}

module.exports = {
  // 📨 Criar nova mensagem
  async criarMensagem(req, res) {
    try {
      const { conteudo } = req.body;
      const { esporteId } = req.params;

      await verificarPermissao(req, esporteId);

      const mensagem = await mensagemService.criarMensagem({
        conteudo,
        usuarioId: req.user.uid,
        usuarioNome: req.user.nome,
        esporteId: String(esporteId) // CORRIGIDO
      });

      res.status(201).json(mensagem);
    } catch (err) {
      console.error('Erro ao criar mensagem:', err);
      res.status(403).json({ error: err.message });
    }
  },

  // 📄 Listar mensagens de um grupo
  async listarMensagens(req, res) {
    try {
      const { esporteId } = req.params;

      await verificarPermissao(req, esporteId);

      const mensagens = await mensagemService.listarMensagens(String(esporteId));
      res.json(mensagens);
    } catch (err) {
      console.error('Erro ao listar mensagens:', err);
      res.status(403).json({ error: err.message });
    }
  },

  // 📝 Editar mensagem (somente autor)
  async editarMensagem(req, res) {
    try {
      const { id } = req.params;
      const { conteudo } = req.body;

      const mensagem = await mensagemService.editarMensagem(id, req.user.uid, conteudo);
      res.json(mensagem);
    } catch (err) {
      console.error('Erro ao editar mensagem:', err);
      res.status(403).json({ error: err.message });
    }
  },  // ❌ Excluir mensagem (autor ou admin)
  async excluirMensagem(req, res) {
    try {
      const { id } = req.params;
      const isAdmin = req.user.role === 'admin';
      
      console.log("Requisição de exclusão de mensagem recebida:");
      console.log("ID da mensagem recebida no parâmetro:", id);
      console.log("Tipo do ID:", typeof id);
      console.log("Usuário:", req.user.uid, "| É admin:", isAdmin);
      
      if (!id) {
        return res.status(400).json({ error: 'ID da mensagem não fornecido' });
      }
      
      // Limpar o ID - remover quaisquer caracteres não seguros
      const cleanId = id.toString().trim();
      console.log("ID da mensagem limpo:", cleanId);
      
      await mensagemService.excluirMensagem(cleanId, req.user.uid, isAdmin);
      console.log("Mensagem excluída com sucesso:", cleanId);
      res.json({ message: 'Mensagem excluída com sucesso.' });
    } catch (err) {
      console.error('Erro ao excluir mensagem:', err);
      
      // Melhor tratamento de erro baseado no tipo
      if (err.message.includes('inválido')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('não encontrada')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('permissão')) {
        return res.status(403).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  },
  // 📌 Fixar/desfixar mensagem (admin)
  async fixarMensagem(req, res) {
    try {
      if (req.user.role !== 'admin') {
        throw new Error('Apenas administradores podem fixar mensagens.');
      }

      const { id } = req.params;
      const { fixada } = req.body;
      
      console.log("Requisição de fixar/desfixar mensagem recebida:");
      console.log("ID da mensagem:", id);
      console.log("Fixar:", fixada);
      
      if (!id) {
        return res.status(400).json({ error: 'ID da mensagem não fornecido' });
      }
      
      // Limpar o ID - remover quaisquer caracteres não seguros
      const cleanId = id.toString().trim();
      console.log("ID da mensagem limpo:", cleanId);

      const mensagem = await mensagemService.fixarMensagem(cleanId, fixada);
      console.log("Mensagem atualizada com sucesso:", mensagem);
      res.json(mensagem);
    } catch (err) {
      console.error('Erro ao fixar mensagem:', err);
      
      // Melhor tratamento de erro baseado no tipo
      if (err.message.includes('inválido')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('não encontrada')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('permissão') || err.message.includes('administradores')) {
        return res.status(403).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  }
};
