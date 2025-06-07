const eventoService = require('../services/eventoService');
const uploadService = require('../services/uploadService');

module.exports = {  // Listar todos os eventos
  async listar(req, res) {
    try {
      const eventos = await eventoService.listarEventos();
      res.json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos:', err);
      res.status(500).json({ error: 'Erro ao listar eventos' });
    }
  },  // Criar evento (admin)
  async criar(req, res) {
    try {
      console.log('📝 EventoController.criar - Body recebido:', req.body);
      console.log('📝 EventoController.criar - Arquivo recebido:', req.file ? 'SIM' : 'NÃO');
      console.log('📝 EventoController.criar - User:', req.user ? req.user.uid : 'NÃO ENCONTRADO');
      
      const { titulo, descricao, tipo, data, local } = req.body;
      const criadorId = req.user.uid;
      let fotoUrl = undefined;

      console.log('📝 Campos extraídos:', { titulo, descricao, tipo, data, local, criadorId });

      // Validações básicas (mesmo padrão do esporteController)
      if (!titulo || !data || !local) {
        console.log('❌ Validação falhou - campos obrigatórios:', { titulo: !!titulo, data: !!data, local: !!local });
        return res.status(400).json({ error: 'Título, data e local são obrigatórios.' });
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
            'eventos'
          );
          console.log('✅ Upload da imagem realizado:', fotoUrl);
        } catch (uploadErr) {
          console.error('❌ Erro ao fazer upload da imagem:', uploadErr.message);
          return res.status(500).json({ error: 'Erro ao fazer upload da imagem', details: uploadErr.message });
        }
      }
      
      const dadosEvento = { 
        titulo, 
        descricao, 
        tipo, 
        data, 
        local, 
        criadorId, 
        fotoUrl 
      };
      
      console.log('📝 Dados que serão enviados para o service:', dadosEvento);
      
      const evento = await eventoService.criarEvento(dadosEvento);
      console.log('✅ Evento criado com sucesso:', evento);
      
      res.status(201).json(evento);
    } catch (err) {
      console.error('❌ EventoController.criar - Erro:', err);
      
      // Tratamento especializado para erros de validação (mesmo padrão do esporteController)
      if (err.message.includes('obrigatórios') || err.message.includes('futura')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: err.message });
    }
  },
  // Editar evento (admin)
  async editar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const evento = await eventoService.editarEvento(id, updateData);
      res.json(evento);
    } catch (err) {
      console.error('Erro ao editar evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao editar evento', details: err.message });
    }
  },

  // Excluir evento (admin)
  async excluir(req, res) {
    try {
      const { id } = req.params;
      await eventoService.excluirEvento(id);
      res.json({ message: 'Evento excluído com sucesso' });
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao excluir evento', details: err.message });
    }
  },

  // Buscar evento por ID
  async buscar(req, res) {
    try {
      const { id } = req.params;
      const evento = await eventoService.buscarEventoPorId(id);
      res.json(evento);
    } catch (err) {
      console.error('Erro ao buscar evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao buscar evento', details: err.message });
    }
  },
  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const { id } = req.params;
      const { nome, email } = req.user;
      const usuarioId = req.user.uid;
      
      await eventoService.inscreverUsuario(id, { usuarioId, nome, email });
      res.status(201).json({ message: 'Inscrição realizada com sucesso' });
    } catch (err) {
      console.error('Erro ao inscrever no evento:', err);
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('já inscrito')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao inscrever no evento', details: err.message });
    }
  },

  // Cancelar inscrição
  async cancelarInscricao(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.uid;
      
      await eventoService.cancelarInscricao(id, usuarioId);
      res.json({ message: 'Inscrição cancelada com sucesso' });
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      if (err.message.includes('não encontrado') || err.message.includes('não encontrada')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao cancelar inscrição', details: err.message });
    }
  },

  // Listar eventos em que o usuário está inscrito
  async meusEventos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const eventos = await eventoService.listarEventosDoUsuario(usuarioId);
      res.json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos inscritos:', err);
      res.status(400).json({ error: 'Erro ao listar eventos inscritos', details: err.message });
    }
  }
};
