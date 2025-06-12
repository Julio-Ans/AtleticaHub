const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.criarProduto = async ({ nome, descricao, preco, estoque, imagemUrl }) => {
  return await prisma.produto.create({
    data: { nome, descricao, preco, estoque, imagemUrl },
  });
};

exports.listarProdutos = async () => {
  return await prisma.produto.findMany();
};

exports.detalharProduto = async (id) => {
  // Convert id to an integer before querying
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    // Handle cases where id is not a valid number, though Prisma would also error
    // You could throw a custom error or return null/undefined as appropriate
    console.error(`Invalid product ID format: ${id}`);
    return null;
  }
  return await prisma.produto.findUnique({ where: { id: productId } });
};

exports.editarProduto = async (id, dados) => {
  return await prisma.produto.update({
    where: { id },
    data: dados,
  });
};

exports.deletarProduto = async (id) => {
  return await prisma.produto.delete({ where: { id } });
};

exports.getInteracoesParaRecomendador = async () => {
  try {
    // 1. Listar todos os produtos para termos um mapa de ID -> nome e uma lista de todos os nomes de produtos
    const todosProdutos = await prisma.produto.findMany({
      select: {
        id: true,
        nome: true,
      },
    });

    if (!todosProdutos || todosProdutos.length === 0) {
      console.log('Nenhum produto encontrado no banco de dados.');
      return []; // Retorna vazio se não há produtos
    }
    const nomesDeTodosOsProdutos = todosProdutos.map(p => p.nome);

    // 2. Buscar todos os pedidos com os itens de pedido e o usuário associado
    const todosPedidos = await prisma.pedido.findMany({
      include: {
        usuario: {
          select: { id: true }, // Apenas o ID do usuário é necessário para "Cliente"
        },
        produtos: { // Relação PedidoProduto
          include: {
            produto: {
              select: { nome: true }, // Apenas o nome do produto é necessário
            },
          },
        },
      },
    });

    if (!todosPedidos || todosPedidos.length === 0) {
      console.log('Nenhum pedido encontrado para gerar interações.');
      return []; // Retorna vazio se não há pedidos
    }

    // 3. Transformar os dados para o formato esperado pelo serviço de ML
    // Formato: [{"Cliente": "ID_Cliente1", "NomeProdutoA": 1, "NomeProdutoB": 0, ...}, ...]
    const interacoesFormatadas = [];
    const interacoesPorCliente = new Map(); // Usar um Map para agrupar por cliente

    todosPedidos.forEach(pedido => {
      if (!pedido.usuario || !pedido.usuario.id) return; // Pular se não houver usuário

      const clienteId = pedido.usuario.id;
      let clienteData = interacoesPorCliente.get(clienteId);

      // Se for a primeira vez vendo este cliente, inicialize seus dados
      if (!clienteData) {
        clienteData = { "Cliente": clienteId };
        nomesDeTodosOsProdutos.forEach(nomeProduto => {
          clienteData[nomeProduto] = 0; // Inicializa todos os produtos como não comprados (0)
        });
        interacoesPorCliente.set(clienteId, clienteData);
      }

      // Marcar os produtos comprados neste pedido como 1
      pedido.produtos.forEach(itemPedido => {
        if (itemPedido.produto && itemPedido.produto.nome) {
          clienteData[itemPedido.produto.nome] = 1; // Ou itemPedido.quantidade se o modelo suportar
        }
      });
    });

    // Converter o Map para o array final
    interacoesPorCliente.forEach(clienteData => {
      interacoesFormatadas.push(clienteData);
    });
    
    console.log('Interações formatadas para ML:', JSON.stringify(interacoesFormatadas, null, 2));
    return interacoesFormatadas;

  } catch (error) {
    console.error('Erro ao buscar interações para o recomendador:', error);
    // Em caso de erro, é melhor retornar um array vazio para não quebrar o fluxo
    // O controller já trata o caso de interações vazias.
    return []; 
  }
};

// Lista de URLs de imagens padrão. Substitua pelas URLs do seu Firebase Storage.
const DEFAULT_IMAGE_URLS = [
  'gs://atleticahub-7b449.firebasestorage.app/produtos/1749432366290_istockphoto-610259354-612x612.jpg'
  // Adicione mais URLs do seu Firebase Storage aqui, se desejar ter variedade
];

/**
 * Atualiza os produtos SEM IMAGEM no banco de dados com uma imagem aleatória de uma lista predefinida.
 * Ideal para popular dados de teste ou garantir que todos os produtos tenham uma imagem.
 */
exports.atualizarTodasAsImagensDeProdutosAleatoriamente = async () => {
  try {
    // 1. Encontrar produtos que não têm imagemUrl ou têm imagemUrl vazia
    const produtosSemImagem = await prisma.produto.findMany({
      where: {
        OR: [
          { imagemUrl: null },
          { imagemUrl: '' }
        ]
      },
      select: { id: true } // Apenas IDs são necessários para a atualização
    });

    if (!produtosSemImagem || produtosSemImagem.length === 0) {
      const mensagemNenhumProduto = 'Nenhum produto sem imagem encontrado para atualizar.';
      console.log(mensagemNenhumProduto);
      return { atualizados: 0, erros: 0, mensagem: mensagemNenhumProduto };
    }

    console.log(`Encontrados ${produtosSemImagem.length} produtos sem imagem para atualizar.`);

    let atualizados = 0;
    let erros = 0;

    for (const produto of produtosSemImagem) {
      // Seleciona uma imagem da lista (se houver mais de uma, será aleatória)
      const randomImageUrl = DEFAULT_IMAGE_URLS[Math.floor(Math.random() * DEFAULT_IMAGE_URLS.length)];
      try {
        await prisma.produto.update({
          where: { id: produto.id },
          data: { imagemUrl: randomImageUrl },
        });
        atualizados++;
      } catch (error) {
        console.error(`Erro ao atualizar imagem do produto ID ${produto.id}:`, error);
        erros++;
      }
    }

    const mensagemConclusao = `Atualização de imagens concluída para produtos sem imagem. Produtos atualizados: ${atualizados}. Erros: ${erros}.`;
    console.log(mensagemConclusao);
    return { atualizados, erros, mensagem: mensagemConclusao };

  } catch (error) {
    console.error('Erro geral ao tentar atualizar imagens dos produtos sem imagem:', error);
    return { atualizados: 0, erros: 0, mensagem: `Erro geral ao processar: ${error.message}` };
  }
};
