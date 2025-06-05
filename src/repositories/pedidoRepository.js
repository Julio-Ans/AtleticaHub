const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PedidoRepository {
  async create(data) { 
    return await prisma.pedido.create({ data }); 
  }

  async findByEmail(email) {
    return await prisma.pedido.findMany({ 
      where: { studentEmail: email },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return await prisma.pedido.findUnique({
      where: { id }
    });
  }

  async updateStatus(id, status) {
    return await prisma.pedido.update({
        where: { id },
        data: { status },
    });
  }

  async findAll() {
    return await prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByStatus(status) {
    return await prisma.pedido.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
  }
}

module.exports = new PedidoRepository();
