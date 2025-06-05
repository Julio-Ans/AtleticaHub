const Evento = require('../models/evento.model');

module.exports = {
  // Listar todos os eventos
  async listar(req, res) {
    try {
      const eventos = await Evento.find().sort({ data: 1 });
      res.json(eventos);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar eventos' });
    }
  },

  // Criar evento (admin)
  async criar(req, res) {
    try {
      const { titulo, descricao, tipo, data, local } = req.body;
      const criadorId = req.user.uid;
      let fotoUrl = undefined;
      if (req.file) {
        // Salva a URL relativa para servir a imagem
        fotoUrl = `/uploads/${req.file.filename}`;
      }
      const evento = await Evento.create({ titulo, descricao, tipo, data, local, criadorId, fotoUrl });
      res.status(201).json(evento);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao criar evento' });
    }
  },

  // Editar evento (admin)
  async editar(req, res) {
    try {
      const { id } = req.params;
      const update = req.body;
      update.updatedAt = new Date();
      const evento = await Evento.findByIdAndUpdate(id, update, { new: true });
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json(evento);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao editar evento' });
    }
  },

  // Excluir evento (admin)
  async excluir(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findByIdAndDelete(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json({ message: 'Evento excluído com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao excluir evento' });
    }
  },

  // Buscar evento por ID
  async buscar(req, res) {
    try {
      const { id } = req.params;
      const evento = await Evento.findById(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      res.json(evento);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao buscar evento' });
    }
  },

  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const { id } = req.params;
      const { nome, email } = req.user;
      const usuarioId = req.user.uid;
      const evento = await Evento.findById(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      if (evento.inscricoes.some(i => i.usuarioId === usuarioId)) {
        return res.status(400).json({ error: 'Usuário já inscrito neste evento' });
      }
      evento.inscricoes.push({ usuarioId, nome, email });
      await evento.save();
      res.status(201).json({ message: 'Inscrição realizada com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao inscrever no evento' });
    }
  },

  // Cancelar inscrição
  async cancelarInscricao(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.user.uid;
      const evento = await Evento.findById(id);
      if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
      const antes = evento.inscricoes.length;
      evento.inscricoes = evento.inscricoes.filter(i => i.usuarioId !== usuarioId);
      if (evento.inscricoes.length === antes) {
        return res.status(404).json({ error: 'Inscrição não encontrada' });
      }
      await evento.save();
      res.json({ message: 'Inscrição cancelada com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao cancelar inscrição' });
    }
  },

  // Listar eventos em que o usuário está inscrito
  async meusEventos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const eventos = await Evento.find({ 'inscricoes.usuarioId': usuarioId });
      res.json(eventos);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao listar eventos inscritos' });
    }
  }
};
