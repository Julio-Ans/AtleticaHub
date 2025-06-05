const produtoRepository = require('../repositories/produtoRepository');
const cartItemRepository = require('../repositories/cartItemRepository');
const pedidoRepository = require('../repositories/pedidoRepository');

class CartService {
  async addToCart({ studentEmail, produtoId, quantidade }) {
    const produto = await produtoRepository.findById(produtoId);
    if (!produto) {
      throw { status: 404, message: 'Produto não encontrado' };
    }
    if (produto.estoque < quantidade) {
      throw { status: 400, message: 'Estoque insuficiente' };
    }

    return await cartItemRepository.add({ studentEmail, produtoId, quantidade });
  }

  async getCart(email) {
    return await cartItemRepository.findByEmail(email);
  }

  async updateCartItem(id, quantidade) {
    const item = await cartItemRepository.findById(id);
    if (!item) {
      throw { status: 404, message: 'Item não encontrado' };
    }
    if (item.produto.estoque < quantidade) {
      throw { status: 400, message: 'Estoque insuficiente' };
    }

    return await cartItemRepository.updateQty(id, quantidade);
  }

  async removeCartItem(id) {
    return await cartItemRepository.remove(id);
  }

  async checkout(studentEmail) {
    const items = await cartItemRepository.findByEmail(studentEmail);
    if (!items.length) {
      throw { status: 400, message: 'Carrinho vazio' };
    }

    let total = 0;
    const produtosPedido = [];

    // Validar estoque e calcular total
    for (const item of items) {
      if (item.produto.estoque < item.quantidade) {
        throw { status: 400, message: `Estoque insuficiente para ${item.produto.nome}` };
      }

      total += item.produto.preco * item.quantidade;
      produtosPedido.push({ 
        produtoId: item.produto.id, 
        quantidade: item.quantidade 
      });
    }

    // Criar pedido
    const pedido = await pedidoRepository.create({
      studentEmail,
      produtos: produtosPedido,
      total,
      status: 'pendente'
    });

    // Atualizar estoque dos produtos
    for (const item of items) {
      await produtoRepository.updateStock(
        item.produto.id,
        item.produto.estoque - item.quantidade
      );
    }

    // Limpar carrinho
    await cartItemRepository.clearCart(studentEmail);

    return pedido;
  }
}

module.exports = new CartService();
