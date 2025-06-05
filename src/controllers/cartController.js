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
