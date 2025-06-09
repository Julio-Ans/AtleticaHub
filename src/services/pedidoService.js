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

// Função para buscar pedidos recentes (admin)
async function listarPedidosRecentes(limite = 10) {
  try {
    const pedidos = await prisma.pedido.findMany({
      take: limite,
      orderBy: {
        createdAt: 'desc'
      },      include: {
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

    return pedidos;
  } catch (error) {
    console.error('❌ Erro ao listar pedidos recentes:', error);
    throw new Error('Erro ao buscar pedidos recentes: ' + error.message);
  }
}

// Função para buscar estatísticas da loja (admin)
async function obterEstatisticasLoja() {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Contar total de pedidos
    const totalPedidos = await prisma.pedido.count();
    
    // Calcular vendas do mês atual
    const vendasMes = await prisma.pedido.aggregate({
      where: {
        createdAt: {
          gte: inicioMes
        }
      },
      _sum: {
        total: true
      }
    });

    return {
      totalPedidos,
      vendasMes: vendasMes._sum.total || 0
    };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas da loja:', error);
    throw new Error('Erro ao buscar estatísticas: ' + error.message);
  }
}

// Função para relatório de vendas por produto (admin)
async function obterRelatorioVendasPorProduto() {
  try {
    const vendas = await prisma.pedidoProduto.groupBy({
      by: ['produtoId'],
      _sum: {
        quantidade: true
      },
      _count: {
        _all: true
      }
    });

    const relatorio = await Promise.all(
      vendas.map(async (venda) => {
        const produto = await prisma.produto.findUnique({
          where: { id: venda.produtoId }
        });

        const receita = (produto?.preco || 0) * (venda._sum.quantidade || 0);

        return {
          produtoId: venda.produtoId,
          nome: produto?.nome || 'Produto não encontrado',
          totalVendido: venda._sum.quantidade || 0,
          totalPedidos: venda._count._all,
          receita: receita
        };
      })
    );

    // Ordenar por quantidade vendida (descendente)
    return relatorio.sort((a, b) => b.totalVendido - a.totalVendido);
  } catch (error) {
    console.error('❌ Erro ao obter relatório de vendas:', error);
    throw new Error('Erro ao gerar relatório de vendas: ' + error.message);
  }
}

// Função para excluir pedido (admin)
async function excluirPedido(pedidoId) {
  try {    // Primeiro, excluir os produtos relacionados
    await prisma.pedidoProduto.deleteMany({
      where: { pedidoId: parseInt(pedidoId) }
    });

    // Depois, excluir o pedido
    const pedidoExcluido = await prisma.pedido.delete({
      where: { id: parseInt(pedidoId) }
    });

    return pedidoExcluido;
  } catch (error) {
    console.error('❌ Erro ao excluir pedido:', error);
    throw new Error('Erro ao excluir pedido: ' + error.message);
  }
}

module.exports = {
  criarPedido,
  listarPedidosUsuario,
  listarVendasAgrupadasPorProduto,
  listarPedidosRecentes,
  obterEstatisticasLoja,
  obterRelatorioVendasPorProduto,
  excluirPedido
};
