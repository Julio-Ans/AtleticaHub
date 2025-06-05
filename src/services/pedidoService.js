const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function criarPedido({ usuarioId, itens, total }) {
  return await prisma.pedido.create({
    data: {
      usuarioId,
      total,
      produtos: {
        create: itens.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade
        }))
      }
    },
    include: {
      produtos: {
        include: {
          produto: true
        }
      }
    }
  });
}

async function listarPedidosUsuario(usuarioId) {
  return await prisma.pedido.findMany({
    where: { usuarioId },
    include: {
      produtos: {
        include: {
          produto: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

async function listarVendasAgrupadasPorProduto() {
  const produtos = await prisma.produto.findMany({
    include: {
      pedidos: {
        include: {
          pedido: {
            include: {
              usuario: true
            }
          }
        }
      }
    }
  });

  return produtos.map(produto => ({
    id: produto.id,
    nome: produto.nome,
    preco: produto.preco,
    imagemUrl: produto.imagemUrl,
    vendas: produto.pedidos.map(p => ({
      pedidoId: p.pedido.id,
      quantidade: p.quantidade,
      dataPedido: p.pedido.createdAt,
      usuario: p.pedido.usuario,
      status: p.pedido.status
    }))
  }));
}


module.exports = {
  criarPedido,
  listarPedidosUsuario,
  listarVendasAgrupadasPorProduto
};
