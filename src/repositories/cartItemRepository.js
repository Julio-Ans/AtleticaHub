const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CartItemRepository {
  async create(data) { 
    return await prisma.cartItem.create({ data }); 
  }
  async findByUserId(usuarioId) {
    return await prisma.cartItem.findMany({
        where: { usuarioId: usuarioId },
        include: { produto: true },
    });
  }

  async findById(id) {
    return await prisma.cartItem.findUnique({
        where: { id },
        include: { produto: true },
    });
  }

  async findByUserAndProduct(usuarioId, produtoId) {
    return await prisma.cartItem.findFirst({
        where: { 
          usuarioId: usuarioId,
          produtoId: produtoId 
        },
        include: { produto: true },
    });
  }

  async updateQuantity(id, quantidade) {
    return await prisma.cartItem.update({
        where: { id },
        data: { quantidade },
    });
  }

  async deleteById(id) { 
    return await prisma.cartItem.delete({ where: { id } }); 
  }
    async deleteByUserId(usuarioId) {
    return await prisma.cartItem.deleteMany({ where: { usuarioId: usuarioId } });
  }
}

module.exports = new CartItemRepository();
