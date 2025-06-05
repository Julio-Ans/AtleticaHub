const produtoService = require('../services/produtoService');

class ProdutoController {
  async create(req, res, next) {
    try {
      const produto = await produtoService.createProduto(req.body);
      res.status(201).json(produto);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      if (error.message.includes('obrigatório') || error.message.includes('já existe')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async list(req, res, next) {
    try {
      const produtos = await produtoService.getAllProdutos();
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getById(req, res, next) {
    try {
      const id = Number(req.params.id);
      const produto = await produtoService.getProdutoById(id);
      res.json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      const produto = await produtoService.updateProduto(id, req.body);
      res.json(produto);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('obrigatório') || error.message.includes('deve ser')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      await produtoService.deleteProduto(id);
      res.json({ message: 'Produto removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new ProdutoController();
