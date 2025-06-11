const inscricaoService = require('../services/inscricaoService');

module.exports = {
  // Criar nova inscrição
  async criarInscricao(req, res) {
    try {
      const { esporteId } = req.params;
      const usuarioId = req.user.uid;

      const inscricao = await inscricaoService.criarInscricao(usuarioId, esporteId);
      
      // Verificar status para personalizar a resposta
      if (inscricao.status === 'pendente') {
        res.status(201).json({
          inscricao,
          message: 'Inscrição enviada com sucesso! Aguardando aprovação.'
        });
      } else {
        res.status(201).json({
          inscricao,
          message: 'Status da inscrição atualizado com sucesso!'
        });
      }
    } catch (err) {
      console.error('Erro ao criar inscrição:', err);
      
      // Tratamento especializado para erros comuns
      if (err.message.includes('grupo Geral') || 
          err.message.includes('já está inscrito')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  },

  // Listar inscrições pendentes por esporte
  async listarPendentes(req, res) {
    try {
      const { esporteId } = req.params;
      const inscricoes = await inscricaoService.listarPendentes(esporteId);
      res.json(inscricoes);
    } catch (err) {
      console.error('Erro ao listar inscrições pendentes:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // Atualizar status da inscrição
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['aceito', 'recusado', 'pendente'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Use: aceito, recusado ou pendente.' });
      }

      const inscricao = await inscricaoService.atualizarStatus(id, status);
      res.json(inscricao);
    } catch (err) {
      console.error('Erro ao atualizar status da inscrição:', err);
      
      // Tratamento especializado para erros comuns
      if (err.message.includes('não encontrada')) {
        return res.status(404).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  },
  // Listar minhas inscrições
  async listarMinhasInscricoes(req, res) {
    try {
      const usuarioId = req.user.uid;
      console.log('📝 DEBUG listarMinhasInscricoes - Usuario ID:', usuarioId);
      
      const inscricoes = await inscricaoService.listarPorUsuario(usuarioId);
      console.log('📝 DEBUG listarMinhasInscricoes - Inscricoes retornadas:', inscricoes);
      
      res.json(inscricoes);
    } catch (err) {
      console.error('Erro ao listar inscrições do usuário:', err);
      res.status(500).json({ error: err.message });
    }
  },
  
  // 🐛 DEBUG: Endpoint temporário para debug
  async debugInscricoes(req, res) {
    try {
      const usuarioId = req.user.uid;
      console.log('🐛 DEBUG ENDPOINT - Usuario ID:', usuarioId);
      console.log('🐛 DEBUG ENDPOINT - Usuario completo:', req.user);
      
      const inscricoes = await inscricaoService.listarPorUsuario(usuarioId);
      
      res.json({
        usuario: {
          uid: req.user.uid,
          nome: req.user.nome,
          role: req.user.role
        },
        inscricoes: inscricoes,
        totalInscricoes: inscricoes.length
      });
    } catch (err) {
      console.error('🐛 Erro no debug:', err);
      res.status(500).json({ error: err.message });
    }
  }
  };
