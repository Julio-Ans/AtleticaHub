const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EsporteRepository {
  async findAll() {
    return await prisma.esporte.findMany({
      orderBy: { nome: 'asc' }
    });
  }
  async findById(id) {
    return await prisma.esporte.findUnique({
      where: { id: String(id) }
    });
  }

  async create(esporteData) {
    return await prisma.esporte.create({
      data: esporteData
    });
  }
  async update(id, updateData) {
    return await prisma.esporte.update({
      where: { id: String(id) },
      data: updateData
    });
  }  async delete(id) {
    // Use transaction to ensure both operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      // First, delete all inscriptions for this sport
      await tx.inscricao.deleteMany({
        where: { esporteId: String(id) }
      });
      
      // Then delete the sport
      return await tx.esporte.delete({
        where: { id: String(id) }
      });
    });
  }

  async findByName(nome) {
    return await prisma.esporte.findFirst({
      where: { nome }
    });
  }  async countInscricoes(esporteId) {
    return await prisma.inscricao.count({
      where: { 
        esporteId: String(esporteId)
      }
    });
  }
}

module.exports = new EsporteRepository();
