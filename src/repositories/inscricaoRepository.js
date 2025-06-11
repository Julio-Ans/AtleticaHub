const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class InscricaoRepository {
  async findAll() {
    return await prisma.inscricao.findMany({
      orderBy: { criadaEm: 'desc' }
    });
  }
  async findById(id) {
    return await prisma.inscricao.findUnique({
      where: { id: String(id) }
    });
  }

  async create(inscricaoData) {
    return await prisma.inscricao.create({
      data: inscricaoData
    });
  }
  async update(id, updateData) {
    return await prisma.inscricao.update({
      where: { id: String(id) },
      data: updateData
    });
  }
  async delete(id) {
    return await prisma.inscricao.delete({
      where: { id: String(id) }
    });
  }
  async findByUserAndSport(usuarioId, esporteId) {
    return await prisma.inscricao.findFirst({
      where: {
        usuarioId,
        esporteId: String(esporteId)
      }
    });
  }
  async findByUser(usuarioId) {
    console.log('🔍 InscricaoRepository.findByUser - Buscando para usuário:', usuarioId);
    const result = await prisma.inscricao.findMany({
      where: { usuarioId },
      orderBy: { criadaEm: 'desc' }
    });
    console.log('🔍 InscricaoRepository.findByUser - Resultado:', result);
    return result;
  }
  async findBySport(esporteId) {
    return await prisma.inscricao.findMany({
      where: { esporteId: String(esporteId) },
      orderBy: { criadaEm: 'desc' }
    });
  }
  async findPendingBySport(esporteId) {
    return await prisma.inscricao.findMany({
      where: {
        esporteId: String(esporteId),
        status: 'pendente'
      },
      include: {
        usuario: true
      },
      orderBy: { criadaEm: 'asc' }
    });
  }
  async updateStatus(id, status) {
    return await prisma.inscricao.update({
      where: { id: String(id) },
      data: { status }
    });
  }

  async findByStatus(status) {
    return await prisma.inscricao.findMany({
      where: { status },
      orderBy: { criadaEm: 'desc' }
    });
  }
}

module.exports = new InscricaoRepository();
