const pedidoService = require('../services/pedidoService');

class PedidoController {
  async list(req, res, next) {
    try {
      const { studentEmail } = req.query;
      const pedidos = await pedidoService.listarPedidos(studentEmail);
      res.json(pedidos);
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      if (error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res, next) {
    try {
      const id = Number(req.params.id);
      const pedido = await pedidoService.getPedidoById(id);
      res.json(pedido);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async pay(req, res, next) {
    try {
      const id = Number(req.params.id);
      const pedido = await pedidoService.processPayment(id);
      res.json(pedido);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('já foi pago') || error.message.includes('cancelado')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async cancel(req, res, next) {
    try {
      const id = Number(req.params.id);
      const pedido = await pedidoService.cancelarPedido(id);
      res.json(pedido);
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('já pago')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listAll(req, res, next) {
    try {
      const pedidos = await pedidoService.getAllPedidos();
      res.json(pedidos);
    } catch (error) {
      console.error('Erro ao listar todos os pedidos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new PedidoController();
