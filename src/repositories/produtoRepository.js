const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ProdutoRepository {
  async create(data) { 
    return await prisma.produto.create({ data }); 
  }

  async findAll() { 
    return await prisma.produto.findMany({
      orderBy: { nome: 'asc' }
    }); 
  }

  async findById(id) { 
    return await prisma.produto.findUnique({ where: { id } }); 
  }

  async update(id, data) {
    return await prisma.produto.update({ where: { id }, data });
  }

  async remove(id) {
    return await prisma.produto.delete({ where: { id } });
  }

  async findByName(nome) {
    return await prisma.produto.findFirst({
      where: { nome }
    });
  }

  async updateStock(id, novoEstoque) {
    return await prisma.produto.update({
      where: { id },
      data: { estoque: novoEstoque }
    });
  }

  async findInStock() {
    return await prisma.produto.findMany({
      where: {
        estoque: {
          gt: 0
        }
      },
      orderBy: { nome: 'asc' }
    });
  }
}

module.exports = new ProdutoRepository();
