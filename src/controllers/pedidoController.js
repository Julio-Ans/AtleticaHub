const pedidoService = require('../services/pedidoService');
const { PrismaClient } = require('@prisma/client');  
const prisma = new PrismaClient();               

async function criarPedido(req, res) {
  try {
    const usuarioId = req.user.uid;
    const { itens, total } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ error: 'Itens do pedido são obrigatórios' });
    }

    const pedido = await pedidoService.criarPedido({ usuarioId, itens, total });
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function listarPedidosUsuario(req, res) {
  try {
    const usuarioId = req.user.uid;
    console.log('🔍 Controller - Buscando pedidos para usuário:', usuarioId);
    
    const pedidos = await pedidoService.listarPedidosUsuario(usuarioId);
    console.log('✅ Controller - Pedidos retornados:', pedidos.length);
    
    res.status(200).json(pedidos);
  } catch (err) {
    console.error('❌ Controller - Erro ao listar pedidos:', err);
    res.status(500).json({ error: err.message });
  }
}

async function listarVendasAdmin(req, res) {
  try {
    const vendas = await pedidoService.listarVendasAgrupadasPorProduto();
    res.status(200).json(vendas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function atualizarStatusPedido(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    if (!["pago", "entregue", "pendente"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    // Verifica se o pedido existe
    const pedidoExiste = await prisma.pedido.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pedidoExiste) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    const pedido = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json(pedido);
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar o status do pedido.' });
  }
}


module.exports = {
  criarPedido,
  listarPedidosUsuario,
  listarVendasAdmin,
  atualizarStatusPedido
};
