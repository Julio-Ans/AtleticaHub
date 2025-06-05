const cartService = require('../services/cartService');

class CartController {
  async addToCart(req, res) {
    try {
      const { studentEmail, produtoId, quantidade } = req.body;
      
      if (!studentEmail || !produtoId || !quantidade) {
        return res.status(400).json({ 
          error: 'studentEmail, produtoId e quantidade são obrigatórios' 
        });
      }

      const cartItem = await cartService.addToCart({ studentEmail, produtoId, quantidade });
      res.status(201).json(cartItem);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getCart(req, res) {
    try {
      const { studentEmail } = req.query;
      
      if (!studentEmail) {
        return res.status(400).json({ error: 'studentEmail é obrigatório' });
      }

      const items = await cartService.getCart(studentEmail);
      res.json(items);
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async updateCartItem(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;
      
      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
      }

      const cartItem = await cartService.updateCartItem(Number(id), quantidade);
      res.json(cartItem);
    } catch (error) {
      console.error('Erro ao atualizar item do carrinho:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeCartItem(req, res) {
    try {
      const { id } = req.params;
      
      await cartService.removeCartItem(Number(id));
      res.json({ message: 'Item removido do carrinho' });
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async checkout(req, res) {
    try {
      const { studentEmail } = req.body;
      
      if (!studentEmail) {
        return res.status(400).json({ error: 'studentEmail é obrigatório' });
      }

      const pedido = await cartService.checkout(studentEmail);
      res.status(201).json(pedido);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CartController();
