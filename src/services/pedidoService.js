const pedidoRepository = require('../repositories/pedidoRepository');

class PedidoService {
  async listarPedidos(email) {
    if (!email) {
      throw new Error('Email é obrigatório');
    }
    return await pedidoRepository.findByEmail(email);
  }

  async getPedidoById(id) {
    const pedido = await pedidoRepository.findById(id);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }
    return pedido;
  }

  async processPayment(id) {
    const pedido = await pedidoRepository.findById(id);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.status === 'pago') {
      throw new Error('Pedido já foi pago');
    }

    if (pedido.status === 'cancelado') {
      throw new Error('Não é possível pagar um pedido cancelado');
    }

    return await pedidoRepository.updateStatus(id, 'pago');
  }

  async cancelarPedido(id) {
    const pedido = await pedidoRepository.findById(id);
    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.status === 'pago') {
      throw new Error('Não é possível cancelar um pedido já pago');
    }

    return await pedidoRepository.updateStatus(id, 'cancelado');
  }

  async getAllPedidos() {
    return await pedidoRepository.findAll();
  }
}

module.exports = new PedidoService();
