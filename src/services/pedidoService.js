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
  try {
    console.log('🔍 Buscando pedidos para usuário:', usuarioId);
    
    // Verificar se o usuário existe na tabela Usuario usando o UID do Firebase
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });
    
    if (!usuarioExiste) {
      console.log('⚠️ Usuário não encontrado na tabela Usuario:', usuarioId);
      return []; // Retorna array vazio se usuário não existe
    }
    
    // Query mais defensiva - testar se a relação funciona
    try {
      const pedidos = await prisma.pedido.findMany({
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
      
      console.log('✅ Pedidos encontrados:', pedidos.length);
      return pedidos;
      
    } catch (includeError) {
      console.error('❌ Erro com include, tentando query simples:', includeError.message);
      
      // Fallback: query sem includes se a relação falhar
      const pedidosSimples = await prisma.pedido.findMany({
        where: { usuarioId },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log('⚠️ Retornando pedidos sem produtos (fallback):', pedidosSimples.length);
      return pedidosSimples;
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar pedidos do usuário:', error);
    throw new Error('Erro ao buscar pedidos do usuário: ' + error.message);
  }
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
