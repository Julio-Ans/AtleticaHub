const userRepository = require('../repositories/userRepository');
const esporteRepository = require('../repositories/esporteRepository');
const inscricaoRepository = require('../repositories/inscricaoRepository');

/**
 * Inscreve automaticamente um administrador em todos os esportes
 * @param {string} userId ID do usuário admin
 * @returns {Promise<{success: boolean, message?: string, error?: string}>} Resultado da operação
 */
async function inscreverAdminEmTodosEsportes(userId) {
  try {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }
    
    // Buscar todos os esportes
    const esportes = await esporteRepository.findAll();
    
    if (!esportes || esportes.length === 0) {
      return { 
        success: true, 
        message: 'Nenhum esporte encontrado para inscrição' 
      };
    }
    
    // Para cada esporte, verificar se o admin já está inscrito
    for (const esporte of esportes) {
      const inscricaoExistente = await inscricaoRepository.findByUserAndSport(
        userId, 
        esporte.id
      );
      
      // Se não estiver inscrito, criar inscrição com status 'aceito'
      if (!inscricaoExistente) {
        await inscricaoRepository.create({
          usuarioId: userId,
          esporteId: esporte.id,
          status: 'aceito' // Admins são aceitos automaticamente
        });
        console.log(`Admin ${userId} inscrito no esporte ${esporte.nome}`);
      }
    }
    
    return { 
      success: true, 
      message: `Admin inscrito em ${esportes.length} esportes com sucesso` 
    };
  } catch (error) {
    console.error('Erro ao inscrever admin em esportes:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao processar inscrições' 
    };
  }
}

/**
 * Inscreve todos os administradores em um esporte específico
 * @param {string} esporteId ID do esporte
 */
async function inscreverTodosAdminsEmEsporte(esporteId) {
  try {
    // Buscar todos os admins
    const admins = await userRepository.findByRole('admin');
    
    // Para cada admin, criar inscrição no esporte se não existir
    for (const admin of admins) {
      const inscricaoExistente = await inscricaoRepository.findByUserAndSport(
        admin.id,
        esporteId
      );
      
      if (!inscricaoExistente) {
        await inscricaoRepository.create({
          usuarioId: admin.id,
          esporteId: esporteId,
          status: 'aceito'
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