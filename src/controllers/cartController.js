<<<<<<< HEAD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listCart = async (req, res) => {
  try {
    // user autenticado, sempre usar o email do token!
    const studentEmail = req.user.email;
    const items = await prisma.cartItem.findMany({
      where: { studentEmail },
      include: { produto: true }
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const studentEmail = req.user.email;
    const { produtoId, quantidade } = req.body;

    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    if (produto.estoque < quantidade)
      return res.status(400).json({ error: 'Estoque insuficiente' });

    const cartItem = await prisma.cartItem.create({
      data: { studentEmail, produtoId, quantidade }
    });
    res.status(201).json(cartItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar ao carrinho' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.cartItem.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
};

exports.checkout = async (req, res) => {
  try {
    const usuarioId = req.user.uid;      // UID do Firebase
    const studentEmail = req.user.email; // E-mail do usuário

    // Busca os itens do carrinho desse usuário
    const items = await prisma.cartItem.findMany({
      where: { studentEmail },
      include: { produto: true }
    });
    if (!items.length) return res.status(400).json({ error: 'Carrinho vazio!' });

    // Verifica estoque e calcula total
    let total = 0;
    const produtosPedido = [];
    for (const item of items) {
      if (item.produto.estoque < item.quantidade) {
        return res.status(400).json({ error: `Estoque insuficiente para ${item.produto.nome}` });
      }
      total += item.produto.preco * item.quantidade;
      produtosPedido.push({
        produtoId: item.produto.id,
        quantidade: item.quantidade
      });
      // Atualiza estoque do produto
      await prisma.produto.update({
        where: { id: item.produto.id },
        data: { estoque: item.produto.estoque - item.quantidade }
      });
    }

    // Cria pedido e itens de pedido
    const pedido = await prisma.pedido.create({
      data: {
        usuarioId,
        total,
        status: 'pendente',
        produtos: { create: produtosPedido }
      }
    });

    // Limpa carrinho desse usuário
    await prisma.cartItem.deleteMany({ where: { studentEmail } });

    res.status(201).json(pedido);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao finalizar pedido' });
  }
};
=======
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
>>>>>>> 0f2cac010ee72d758b8eca3c0cc3e60b47611215
