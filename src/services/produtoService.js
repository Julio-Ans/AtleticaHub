const produtoRepository = require('../repositories/produtoRepository');

class ProdutoService {
  async createProduto(data) {
    // Validações de negócio
    if (!data.nome || data.nome.trim() === '') {
      throw new Error('Nome do produto é obrigatório');
    }
    
    if (!data.preco || data.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (data.estoque < 0) {
      throw new Error('Estoque não pode ser negativo');
    }

    // Verificar se produto já existe
    const produtoExistente = await produtoRepository.findByName(data.nome.trim());
    if (produtoExistente) {
      throw new Error('Já existe um produto com este nome');
    }

    return await produtoRepository.create({
      ...data,
      nome: data.nome.trim()
    });
  }

  async getAllProdutos() {
    return await produtoRepository.findAll();
  }

  async getProdutoById(id) {
    const produto = await produtoRepository.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    return produto;
  }

  async updateProduto(id, data) {
    const produto = await produtoRepository.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    // Validações
    if (data.nome && data.nome.trim() === '') {
      throw new Error('Nome do produto não pode estar vazio');
    }
    
    if (data.preco && data.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (data.estoque && data.estoque < 0) {
      throw new Error('Estoque não pode ser negativo');
    }

    const updateData = { ...data };
    if (data.nome) {
      updateData.nome = data.nome.trim();
    }

    return await produtoRepository.update(id, updateData);
  }

  async deleteProduto(id) {
    const produto = await produtoRepository.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    return await produtoRepository.remove(id);
  }
}

module.exports = new ProdutoService();
