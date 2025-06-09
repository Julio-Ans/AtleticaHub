const cartService = require('../services/cartService');

module.exports = {  // Listar itens do carrinho
  async listar(req, res) {
    try {
      const usuarioId = req.user.uid;
      const items = await cartService.listarItens(usuarioId);
      res.json(items);
    } catch (err) {
      console.error('Erro ao listar carrinho:', err);
      res.status(500).json({ error: 'Erro ao buscar carrinho' });
    }
  },

  // Adicionar item ao carrinho
  async adicionar(req, res) {
    try {
      const usuarioId = req.user.uid;
      const { produtoId, quantidade } = req.body;

      // Validações básicas
      if (!produtoId || !quantidade) {
        return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
      }

      if (quantidade <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
      }

      const cartItem = await cartService.adicionarItem({
        usuarioId,
        produtoId: parseInt(produtoId),
        quantidade: parseInt(quantidade)
      });

      res.status(201).json(cartItem);
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
      
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      
      if (err.message.includes('insuficiente')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
    }
  },

  // Atualizar quantidade de um item
  async atualizarQuantidade(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      // Validações básicas
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
      }

      const item = await cartService.atualizarQuantidade(
        parseInt(id), 
        parseInt(quantidade)
      );

      res.json(item);
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      
      if (err.message.includes('insuficiente')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: 'Erro ao atualizar quantidade' });
    }
  },

  // Remover item do carrinho
  async remover(req, res) {
    try {
      const { id } = req.params;
      
      await cartService.removerItem(parseInt(id));
      res.status(204).send();
    } catch (err) {
      console.error('Erro ao remover item:', err);
      
      if (err.message.includes('não encontrado')) {
        return res.status(404).json({ error: err.message });
      }
      
      res.status(500).json({ error: 'Erro ao remover item' });
    }
  },
  // Finalizar pedido (checkout)
  async checkout(req, res) {
    try {
      const usuarioId = req.user.uid;

      const pedido = await cartService.finalizarPedido(usuarioId);

      res.status(201).json({
        pedido,
        message: 'Pedido finalizado com sucesso!'
      });
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      
      if (err.message.includes('vazio')) {
        return res.status(400).json({ error: err.message });
      }
      
      if (err.message.includes('insuficiente')) {
        return res.status(400).json({ error: err.message });
      }
      
      res.status(500).json({ error: 'Erro ao finalizar pedido' });
    }
  },

  // Limpar carrinho
  async limpar(req, res) {
    try {
      const usuarioId = req.user.uid;
      
      await cartService.limparCarrinho(usuarioId);
      res.json({ message: 'Carrinho limpo com sucesso' });
    } catch (err) {
      console.error('Erro ao limpar carrinho:', err);
      res.status(500).json({ error: 'Erro ao limpar carrinho' });
    }
  }
};
