const eventInscricaoService = require('../services/eventInscricaoService');

module.exports = {
  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const usuarioId = req.user.uid;
      const { eventId } = req.params;
      
      const inscricao = await eventInscricaoService.inscreverUsuario(usuarioId, eventId);
      res.status(201).json(inscricao);
    } catch (err) {
      console.error('Erro ao inscrever no evento:', err);
      if (err.message.includes('já inscrito')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao inscrever no evento' });
    }
  },

  // Cancelar inscrição
  async cancelar(req, res) {
    try {
      const usuarioId = req.user.uid;
      const { eventId } = req.params;
      
      const result = await eventInscricaoService.cancelarInscricao(usuarioId, eventId);
      res.json(result);
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      if (err.message.includes('não encontrada')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(400).json({ error: 'Erro ao cancelar inscrição' });
    }
  },

  // Listar eventos em que o usuário está inscrito
  async meusEventos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const inscricoes = await eventInscricaoService.listarEventosDoUsuario(usuarioId);
      res.json(inscricoes);
    } catch (err) {
      console.error('Erro ao listar inscrições:', err);
      res.status(400).json({ error: 'Erro ao listar inscrições' });
    }
  }
};
