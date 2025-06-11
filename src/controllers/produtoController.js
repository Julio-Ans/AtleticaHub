const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { bucket } = require('../config/firebaseAdmin');
const uploadService = require('../services/uploadService');

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

module.exports = {
  criarProduto,
  listarProdutos,
  detalharProduto,
  editarProduto,
  deletarProduto
};
