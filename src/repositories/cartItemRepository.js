const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CartItemRepository {
  async create(data) { 
    return await prisma.cartItem.create({ data }); 
  }

  async findByEmail(email) {
    return await prisma.cartItem.findMany({
        where: { studentEmail: email },
        include: { produto: true },
    });
  }

  async findById(id) {
    return await prisma.cartItem.findUnique({
        where: { id },
        include: { produto: true },
    });
  }

  async findByEmailAndProduct(email, produtoId) {
    return await prisma.cartItem.findFirst({
        where: { 
          studentEmail: email,
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
  
  async deleteByEmail(email) {
    return await prisma.cartItem.deleteMany({ where: { studentEmail: email } });
  }
}

module.exports = new CartItemRepository();
