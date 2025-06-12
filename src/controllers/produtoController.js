const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { bucket } = require('../config/firebaseAdmin');
const uploadService = require('../services/uploadService');
const produtoService = require('../services/produtoService'); // Seu serviço para acessar dados de produtos no DB
const recomendacaoService = require('../services/recomendacaoService');

const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const imagem = req.file;

    if (!nome || !descricao || !preco || !estoque || !imagem) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }    // Usar uploadService para consistência com eventos/esportes
    const imagemUrl = await uploadService.uploadFile(
      imagem.buffer,
      imagem.originalname,
      'produtos'
    );

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        estoque: parseInt(estoque),
        imagemUrl
      }
    });

    res.status(201).json({ message: 'Produto criado com sucesso', produto: novoProduto });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar o produto' });
  }
};


const listarProdutos = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.status(200).json(produtos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};

const detalharProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(id) } });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.status(200).json(produto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

const editarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque } = req.body;

    const dadosAtualizados = {
      nome,
      descricao,
      preco: parseFloat(preco),
      estoque: parseInt(estoque)
    };

    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }    // Se o admin enviou uma nova imagem, salva no Firebase
    if (req.file) {
      // Exclui imagem anterior, se houver
      if (produto.imagemUrl) {
        try {
          await uploadService.deleteFile(produto.imagemUrl);
        } catch (err) {
          // Só mostra warning se não for erro 404 (arquivo não encontrado)
          if (!(err.code === 404 || err.code === '404' || err.message?.includes('No such object'))) {
            console.warn('⚠️ Falha ao remover imagem antiga do Firebase:', err.message);
          }
        }
      }// Usar uploadService para consistência
      dadosAtualizados.imagemUrl = await uploadService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        'produtos'
      );
    }

    // Atualiza produto no Prisma
    const produtoAtualizado = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: dadosAtualizados
    });

    res.status(200).json(produtoAtualizado);
  } catch (err) {
    console.error('Erro ao editar produto:', err);
    res.status(500).json({ error: 'Erro ao editar produto' });
  }
};

const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Iniciando exclusão do produto ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // Busca o produto antes de deletar para pegar o nome da imagem
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('📦 Produto encontrado:', produto.nome);

    // Extrai o caminho da imagem do Firebase e remove usando uploadService
    if (produto.imagemUrl) {
      try {
        await uploadService.deleteFile(produto.imagemUrl);
        console.log('🖼️ Imagem removida do Firebase');
      } catch (err) {
        // Só mostra warning se não for erro 404 (arquivo não encontrado)
        if (!(err.code === 404 || err.code === '404' || err.message?.includes('No such object'))) {
          console.warn('⚠️ Falha ao remover imagem do Firebase:', err.message);
        }
        console.log('🖼️ Imagem não encontrada no Firebase (ignorado)');
      }
    }    // Remove todos os itens de carrinho que referenciam este produto
    const itensCarrinhoRemovidos = await prisma.cartItem.deleteMany({
      where: { produtoId: parseInt(id) }
    });
    console.log('🛒 Itens de carrinho removidos:', itensCarrinhoRemovidos.count);

    // Verifica se há pedidos vinculados e remove as relações
    const pedidosVinculados = await prisma.pedidoProduto.findMany({
      where: { produtoId: parseInt(id) }
    });

    if (pedidosVinculados.length > 0) {
      console.log('⚠️ Produto vinculado a pedidos:', pedidosVinculados.length);
      console.log('🗑️ Removendo relações produto-pedido...');
      
      // Remove todas as relações produto-pedido
      const relacoesRemovidas = await prisma.pedidoProduto.deleteMany({
        where: { produtoId: parseInt(id) }
      });
      console.log('🗑️ Relações produto-pedido removidas:', relacoesRemovidas.count);
    }

    console.log('✅ Prosseguindo com exclusão do produto...');

    // Remove o produto do banco
    const produtoExcluido = await prisma.produto.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Produto excluído do banco:', produtoExcluido.id);
    res.status(200).json({ message: 'Produto excluído com sucesso' });  } catch (err) {
    console.error('❌ Erro ao excluir produto:', err);
    res.status(500).json({ error: err.message });
  }
};

async function getProdutoDetalhesComRecomendacoes(req, res) {
  const { id } = req.params; // ID do produto que o usuário está vendo
  const quantidadeRecomendacoes = parseInt(req.query.quantidade || '3');

  try {
    const produto = await produtoService.detalharProduto(id);
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const interacoesDosClientesComProdutos = await produtoService.getInteracoesParaRecomendador();

    if (!interacoesDosClientesComProdutos || interacoesDosClientesComProdutos.length === 0) {
        return res.status(200).json({
            produto: produto,
            recomendados: [],
            message: "Não há dados de interação suficientes para gerar recomendações."
        });
    }

    const nomesDosRecomendados = await recomendacaoService.getRecommendations(
      interacoesDosClientesComProdutos,
      produto.nome,
      quantidadeRecomendacoes
    );

    let produtosRecomendadosCompletos = [];
    if (nomesDosRecomendados && nomesDosRecomendados.length > 0) {
      // Buscar os detalhes completos dos produtos recomendados
      produtosRecomendadosCompletos = await prisma.produto.findMany({
        where: {
          nome: {
            in: nomesDosRecomendados
          }
        }
      });
      // Opcional: Manter a ordem original dos recomendados, se necessário
      // Isto pode ser importante se a ordem da ML service for relevante
      produtosRecomendadosCompletos.sort((a, b) => {
        return nomesDosRecomendados.indexOf(a.nome) - nomesDosRecomendados.indexOf(b.nome);
      });
    }

    return res.status(200).json({
      produto: produto,
      recomendados: produtosRecomendadosCompletos, // Agora envia os objetos completos
    });

  } catch (error) {
    console.error('Erro ao obter detalhes do produto e recomendações:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao processar sua requisição.' });
  }
}

// Nova função para o controller
const atualizarImagensProdutosAleatoriamente = async (req, res) => {
  try {
    // Chamar o serviço para atualizar as imagens
    const resultado = await produtoService.atualizarTodasAsImagensDeProdutosAleatoriamente();
    
    // Verificar se houve erros no processo do serviço
    if (resultado.erros > 0 && resultado.atualizados === 0) {
      // Se apenas erros ocorreram, pode ser um erro 500 ou 404 dependendo da natureza
      // Se nenhum produto foi encontrado, o serviço já retorna uma mensagem específica.
      return res.status(500).json({ 
        message: resultado.mensagem || 'Falha ao atualizar imagens dos produtos.',
        detalhes: resultado
      });
    }

    if (resultado.atualizados === 0 && resultado.erros === 0 && resultado.mensagem.includes('Nenhum produto')){
        return res.status(404).json({message: resultado.mensagem, detalhes: resultado });
    }

    // Se chegou aqui, pelo menos algumas atualizações podem ter ocorrido
    res.status(200).json({
      message: resultado.mensagem || 'Processo de atualização de imagens concluído.',
      detalhes: resultado
    });

  } catch (error) {
    console.error('Erro no controller ao tentar atualizar imagens dos produtos:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor ao tentar atualizar imagens dos produtos.',
      error: error.message 
    });
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  detalharProduto,
  editarProduto,
  deletarProduto,
  getProdutoDetalhesComRecomendacoes,
  atualizarImagensProdutosAleatoriamente // Adicionar a nova função aqui
};
