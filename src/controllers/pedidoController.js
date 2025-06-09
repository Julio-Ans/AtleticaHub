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

// Buscar pedido por ID (admin ou próprio pedido)
async function buscarPedidoPorId(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.user.uid;
    const isAdmin = req.user.role === 'admin';

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            nome: true,
            telefone: true
          }
        },
        produtos: {
          include: {
            produto: {
              select: {
                nome: true,
                preco: true
              }
            }
          }
        }
      }
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Verificar se o usuário pode ver este pedido
    if (!isAdmin && pedido.usuarioId !== usuarioId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Formatear resposta para compatibilidade com frontend
    const pedidoFormatado = {
      ...pedido,
      itens: pedido.produtos
    };

    res.status(200).json({ pedido: pedidoFormatado });
  } catch (err) {
    console.error('❌ Erro ao buscar pedido:', err);
    res.status(500).json({ error: err.message });
  }
}

async function atualizarStatusPedido(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }    if (!["pendente", "processando", "entregue", "cancelado"].includes(status)) {
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

// Listar pedidos recentes para admin
async function listarPedidosRecentes(req, res) {
  try {
    const pedidos = await pedidoService.listarPedidosRecentes(10);
    res.status(200).json({ pedidos });
  } catch (err) {
    console.error('❌ Erro ao listar pedidos recentes:', err);
    res.status(500).json({ error: err.message });
  }
}

// Obter estatísticas da loja para admin
async function obterEstatisticasLoja(req, res) {
  try {
    const estatisticas = await pedidoService.obterEstatisticasLoja();
    res.status(200).json(estatisticas);
  } catch (err) {
    console.error('❌ Erro ao obter estatísticas:', err);
    res.status(500).json({ error: err.message });
  }
}

// Obter relatório de vendas por produto para admin
async function obterRelatorioVendas(req, res) {
  try {
    const relatorio = await pedidoService.obterRelatorioVendasPorProduto();
    res.status(200).json({ relatorio });
  } catch (err) {
    console.error('❌ Erro ao obter relatório de vendas:', err);
    res.status(500).json({ error: err.message });
  }
}

// Excluir pedido (admin)
async function excluirPedido(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await pedidoService.excluirPedido(parseInt(id));
    res.status(200).json({ message: 'Pedido excluído com sucesso' });
  } catch (err) {
    console.error('❌ Erro ao excluir pedido:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  criarPedido,
  listarPedidosUsuario,
  listarVendasAdmin,
  buscarPedidoPorId,
  atualizarStatusPedido,
  listarPedidosRecentes,
  obterEstatisticasLoja,
  obterRelatorioVendas,
  excluirPedido
};
