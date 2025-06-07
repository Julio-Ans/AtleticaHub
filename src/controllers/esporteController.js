const esporteService = require('../services/esporteService');
const uploadService = require('../services/uploadService');

module.exports = {
  // Listar todos os esportes
  async listarEsportes(req, res) {
    try {
      const esportes = await esporteService.listarEsportes();
      res.json(esportes);
    } catch (err) {
      console.error('Erro ao listar esportes:', err);
      res.status(500).json({ error: err.message });
    }
  },  // Criar novo esporte (apenas admin)
  async criarEsporte(req, res) {
    try {
      const { nome } = req.body;
      let fotoUrl = undefined;
      
      if (!nome) {
        return res.status(400).json({ error: 'Nome do esporte é obrigatório.' });
      }

      // Se há um arquivo de foto, fazer upload
      if (req.file) {
        try {
          // Validar arquivo de imagem
          uploadService.validateImageFile(req.file.originalname, req.file.size);
          
          // Upload usando o serviço centralizado
          fotoUrl = await uploadService.uploadFile(
            req.file.buffer, 
            req.file.originalname, 
            'esportes'
          );
        } catch (uploadErr) {
          console.error('Erro ao fazer upload da imagem:', uploadErr.message);
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem', details: uploadErr.message });
        }
      }

      const esporte = await esporteService.criarEsporte(nome, fotoUrl);
      res.status(201).json(esporte);
    } catch (err) {
      console.error('Erro ao criar esporte:', err);
      
      // Tratamento especializado para erros de validação
      if (err.message.includes('Já existe um esporte')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  },
  // Atualizar esporte existente (apenas admin)
  async atualizarEsporte(req, res) {
    try {
      const { id } = req.params;
      const { nome } = req.body;
      let fotoUrl = undefined;
      
      if (!nome) {
        return res.status(400).json({ error: 'Nome do esporte é obrigatório.' });
      }      // Se há um arquivo de foto, fazer upload
      if (req.file) {
        try {
          // Validar arquivo de imagem
          uploadService.validateImageFile(req.file.originalname, req.file.size);
          
          // Upload usando o serviço centralizado
          fotoUrl = await uploadService.uploadFile(
            req.file.buffer, 
            req.file.originalname, 
            'esportes'
          );
        } catch (uploadErr) {
          console.error('Erro ao fazer upload da imagem:', uploadErr.message);
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem', details: uploadErr.message });
        }
      }

      const esporte = await esporteService.atualizarEsporte(id, nome, fotoUrl);
      res.json(esporte);
    } catch (err) {
      console.error('Erro ao atualizar esporte:', err);
      
      // Tratamento especializado para erros comuns
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('Já existe outro esporte')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  },

  // Remover esporte (apenas admin)
  async excluirEsporte(req, res) {
    try {
      const { id } = req.params;
      await esporteService.excluirEsporte(id);
      res.json({ message: 'Esporte removido com sucesso.' });
    } catch (err) {
      console.error('Erro ao remover esporte:', err);
      
      // Tratamento especializado para erros comuns
      if (err.message.includes('Geral não pode ser excluído')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('inscrições ativas')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  }
};