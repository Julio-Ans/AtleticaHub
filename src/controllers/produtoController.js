const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { bucket } = require('../config/firebaseAdmin');

const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const imagem = req.file;

    if (!nome || !descricao || !preco || !estoque || !imagem) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const firebaseFileName = `produtos/${Date.now()}_${imagem.originalname}`;
    const file = bucket.file(firebaseFileName);

    await file.save(imagem.buffer, {
      metadata: {
        contentType: imagem.mimetype
      }
    });

    const imagemUrl = `https://firebasestorage.googleapis.com/v0/b/atleticahub-7b449.firebasestorage.app/o/${encodeURIComponent(firebaseFileName)}?alt=media`;

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
    }

    // Se o admin enviou uma nova imagem, salva no Firebase
    if (req.file) {
      // Exclui imagem anterior, se houver
      if (produto.imagemUrl) {
        const match = produto.imagemUrl.match(/\/o\/(.+)\?alt=media/);
        const firebasePath = match && match[1] ? decodeURIComponent(match[1]) : null;

        if (firebasePath) {
          await bucket.file(firebasePath).delete().catch(err => {
            console.warn('⚠️ Falha ao remover imagem antiga do Firebase:', err.message);
          });
        }
      }

      // Salva nova imagem
      const firebaseFileName = `produtos/${Date.now()}_${req.file.originalname}`;
      const file = bucket.file(firebaseFileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype
        }
      });

      dadosAtualizados.imagemUrl = `https://firebasestorage.googleapis.com/v0/b/atleticahub-7b449.firebasestorage.app/o/${encodeURIComponent(firebaseFileName)}?alt=media`;
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

    // Busca o produto antes de deletar para pegar o nome da imagem
    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Extrai o caminho da imagem do Firebase
    if (produto.imagemUrl) {
      const match = produto.imagemUrl.match(/\/o\/(.+)\?alt=media/);
      const firebasePath = match && match[1] ? decodeURIComponent(match[1]) : null;

      if (firebasePath) {
        await bucket.file(firebasePath).delete().catch(err => {
          console.warn('⚠️ Falha ao remover imagem do Firebase:', err.message);
        });
      }
    }

    // Remove o produto do banco
    await prisma.produto.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};

module.exports = {
  criarProduto,
  listarProdutos,
  detalharProduto,
  editarProduto,
  deletarProduto
};
