const produtoRepository = require('../repositories/produtoRepository');
const cartItemRepository = require('../repositories/cartItemRepository');
const pedidoRepository = require('../repositories/pedidoRepository');

class CartService {
  async adicionarItem({ usuarioId, produtoId, quantidade }) {
    // Validar se o produto existe
    const produto = await produtoRepository.findById(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    // Validar estoque
    if (produto.estoque < quantidade) {
      throw new Error('Estoque insuficiente');
    }

    // Verificar se o item já existe no carrinho
    const itemExistente = await cartItemRepository.findByUserAndProduct(usuarioId, produtoId);
    
    if (itemExistente) {
      // Se já existe, atualizar quantidade
      const novaQuantidade = itemExistente.quantidade + quantidade;
      
      // Validar estoque para a nova quantidade
      if (produto.estoque < novaQuantidade) {
        throw new Error('Estoque insuficiente para a quantidade solicitada');
      }
      
      return await cartItemRepository.updateQuantity(itemExistente.id, novaQuantidade);
    } else {
      // Se não existe, criar novo item
      return await cartItemRepository.create({ usuarioId, produtoId, quantidade });
    }
  }

  async listarItens(usuarioId) {
    return await cartItemRepository.findByUserId(usuarioId);
  }

  async atualizarQuantidade(id, quantidade) {
    // Buscar o item no carrinho
    const item = await cartItemRepository.findById(id);
    if (!item) {
      throw new Error('Item não encontrado no carrinho');
    }

    // Validar estoque
    if (item.produto.estoque < quantidade) {
      throw new Error('Estoque insuficiente');
    }

    return await cartItemRepository.updateQuantity(id, quantidade);
  }

  async removerItem(id) {
    // Verificar se o item existe
    const item = await cartItemRepository.findById(id);
    if (!item) {
      throw new Error('Item não encontrado no carrinho');
    }

    return await cartItemRepository.deleteById(id);
  }
  async finalizarPedido(usuarioId) {
    // Buscar itens do carrinho
    const items = await cartItemRepository.findByUserId(usuarioId);
    if (!items.length) {
      throw new Error('Carrinho vazio');
    }

    let total = 0;
    const produtosPedido = [];

    // Validar estoque e calcular total
    for (const item of items) {
      // Buscar produto atualizado para garantir estoque atual
      const produto = await produtoRepository.findById(item.produto.id);
      
      if (!produto) {
        throw new Error(`Produto ${item.produto.nome} não foi encontrado`);
      }
      
      if (produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`);
      }

      total += produto.preco * item.quantidade;
      produtosPedido.push({ 
        produtoId: produto.id, 
        quantidade: item.quantidade 
      });
    }

    // Criar pedido com os produtos
    const pedido = await pedidoRepository.create({
      usuarioId,
      total,
      status: 'pendente',
      produtos: { 
        create: produtosPedido 
      }
    });

    // Atualizar estoque dos produtos
    for (const item of items) {
      const produto = await produtoRepository.findById(item.produto.id);
      await produtoRepository.updateStock(
        produto.id,
        produto.estoque - item.quantidade
      );
    }

    // Limpar carrinho
    await cartItemRepository.deleteByUserId(usuarioId);

    return pedido;
  }

  async limparCarrinho(usuarioId) {
    return await cartItemRepository.deleteByUserId(usuarioId);
  }
}

module.exports = new CartService();
