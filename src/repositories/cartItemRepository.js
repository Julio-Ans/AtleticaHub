const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CartItemRepository {
  async add(data) { 
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

  async updateQty(id, quantidade) {
    return await prisma.cartItem.update({
        where: { id },
        data: { quantidade },
    });
  }

  async remove(id) { 
    return await prisma.cartItem.delete({ where: { id } }); 
  }
  async clearCart(email) {
    return await prisma.cartItem.deleteMany({ where: { studentEmail: email } });
  }
}

module.exports = new CartItemRepository();
