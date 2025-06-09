const eventoService = require('../services/eventoService');
const inscricaoService = require('../services/inscricaoService');
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
        const { titulo, descricao, tipo, data, local, esporteId } = req.body;
      const criadorId = req.user.uid;
      let fotoUrl = undefined;

      console.log('📝 Campos extraídos:', { titulo, descricao, tipo, data, local, esporteId, criadorId });

      // Validações básicas (mesmo padrão do esporteController)
      if (!titulo || !data || !local || !esporteId) {
        console.log('❌ Validação falhou - campos obrigatórios:', { titulo: !!titulo, data: !!data, local: !!local, esporteId: !!esporteId });
        return res.status(400).json({ error: 'Título, data, local e esporte são obrigatórios.' });
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
        esporteId,
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
  },  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const { id } = req.params;
      const { nome, email } = req.user;
      const usuarioId = req.user.uid;
      
      // Buscar o evento para verificar o esporte associado
      const evento = await eventoService.buscarEventoPorId(id);
      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      
      // Verificar se o usuário tem permissão para se inscrever
      // - Se for evento geral (esporteId = "0"), qualquer um pode se inscrever
      // - Se for admin, pode se inscrever em qualquer evento
      // - Se for usuário comum, precisa estar inscrito no esporte do evento
      if (evento.esporteId !== "0" && req.user.role !== 'admin') {
        const inscricoes = await inscricaoService.listarPorUsuario(usuarioId);
        const inscricaoAceita = inscricoes.find(
          inscricao => inscricao.esporteId === evento.esporteId && inscricao.status === 'aceito'
        );
        
        if (!inscricaoAceita) {
          return res.status(403).json({ 
            error: 'Você precisa estar inscrito no esporte associado a este evento para poder se inscrever.' 
          });
        }
      }
      
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
  },
  // Listar eventos por esporte
  async listarPorEsporte(req, res) {
    try {
      const { esporteId } = req.params;
      const eventos = await eventoService.listarEventosPorEsporte(esporteId);
      res.json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos por esporte:', err);
      res.status(400).json({ error: 'Erro ao listar eventos por esporte', details: err.message });
    }
  },

  // Listar eventos que o usuário pode acessar (baseado em suas inscrições em esportes)
  async listarEventosPermitidos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const isAdmin = req.user.role === 'admin';
      
      // Se for admin, pode ver todos os eventos
      if (isAdmin) {
        const eventos = await eventoService.listarEventos();
        return res.json(eventos);
      }
      
      // Para usuários comuns, buscar eventos baseados em suas inscrições aceitas
      const inscricoes = await inscricaoService.listarPorUsuario(usuarioId);
      const inscricoesAceitas = inscricoes.filter(inscricao => inscricao.status === 'aceito');
      const esportesPermitidos = inscricoesAceitas.map(inscricao => inscricao.esporteId);
      
      // Adicionar eventos gerais (esporteId = "0") 
      esportesPermitidos.push("0");
      
      const eventos = await eventoService.listarEventosPorEsportes(esportesPermitidos);
      res.json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos permitidos:', err);
      res.status(400).json({ error: 'Erro ao listar eventos permitidos', details: err.message });
    }
  },
};
