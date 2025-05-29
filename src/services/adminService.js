const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Inscreve automaticamente um administrador em todos os esportes
 * @param {string} userId ID do usuário admin
 */
async function inscreverAdminEmTodosEsportes(userId) {
  try {
    // Buscar todos os esportes
    const esportes = await prisma.esporte.findMany();
    
    // Para cada esporte, verificar se o admin já está inscrito
    for (const esporte of esportes) {
      const inscricaoExistente = await prisma.inscricao.findFirst({
        where: {
          usuarioId: userId,
          esporteId: esporte.id
        }
      });
      
      // Se não estiver inscrito, criar inscrição com status 'aceito'
      if (!inscricaoExistente) {
        await prisma.inscricao.create({
          data: {
            usuarioId: userId,
            esporteId: esporte.id,
            status: 'aceito' // Admins são aceitos automaticamente
          }
        });
        console.log(`Admin ${userId} inscrito no esporte ${esporte.nome}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inscrever admin em esportes:', error);
    return false;
  }
}

/**
 * Inscreve todos os administradores em um esporte específico
 * @param {string} esporteId ID do esporte
 */
async function inscreverTodosAdminsEmEsporte(esporteId) {
  try {
    // Buscar todos os admins
    const admins = await prisma.usuario.findMany({
      where: {
        role: 'admin'
      }
    });
    
    // Para cada admin, criar inscrição no esporte se não existir
    for (const admin of admins) {
      const inscricaoExistente = await prisma.inscricao.findFirst({
        where: {
          usuarioId: admin.id,
          esporteId: esporteId
        }
      });
      
      if (!inscricaoExistente) {
        await prisma.inscricao.create({
          data: {
            usuarioId: admin.id,
            esporteId: esporteId,
            status: 'aceito'
          }
        });
        console.log(`Admin ${admin.nome} inscrito no novo esporte ${esporteId}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inscrever admins no esporte:', error);
    return false;
  }
}

module.exports = {
  inscreverAdminEmTodosEsportes,
  inscreverTodosAdminsEmEsporte
};