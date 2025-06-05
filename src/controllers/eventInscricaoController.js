const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  // Inscrever usuário em evento
  async inscrever(req, res) {
    try {
      const usuarioId = req.user.uid;
      const { eventId } = req.params;
      // Verifica se já está inscrito
      const jaInscrito = await prisma.eventInscricao.findFirst({ where: { usuarioId, eventId } });
      if (jaInscrito) return res.status(400).json({ error: 'Usuário já inscrito neste evento' });
      const inscricao = await prisma.eventInscricao.create({ data: { usuarioId, eventId } });
      res.status(201).json(inscricao);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao inscrever no evento' });
    }
  },

  // Cancelar inscrição
  async cancelar(req, res) {
    try {
      const usuarioId = req.user.uid;
      const { eventId } = req.params;
      const inscricao = await prisma.eventInscricao.findFirst({ where: { usuarioId, eventId } });
      if (!inscricao) return res.status(404).json({ error: 'Inscrição não encontrada' });
      await prisma.eventInscricao.delete({ where: { id: inscricao.id } });
      res.json({ message: 'Inscrição cancelada com sucesso' });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao cancelar inscrição' });
    }
  },

  // Listar eventos em que o usuário está inscrito
  async meusEventos(req, res) {
    try {
      const usuarioId = req.user.uid;
      const inscricoes = await prisma.eventInscricao.findMany({ where: { usuarioId } });
      res.json(inscricoes);
    } catch (err) {
      res.status(400).json({ error: 'Erro ao listar inscrições' });
    }
  }
};
