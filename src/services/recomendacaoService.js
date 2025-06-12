const axios = require('axios');

// Ensure this URL is correct and includes the specific endpoint path if needed (e.g., /recommend)
const RECOMENDADOR_URL = process.env.RECOMMENDER_ML_URL || 'https://f9ffc712-d5cc-4810-bbc6-6fcad53d4b06-00-2alm5g9iatxns.kirk.replit.dev:5000/recomendar-com-dados';

async function getRecommendations(interacoesUsuario, produtoBase, quantidade = 3) {
  try {
    const response = await axios.post(RECOMENDADOR_URL, {
      interacoes: interacoesUsuario,
      produto: produtoBase,
      quantidade: quantidade
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // More browser-like User-Agent
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json' // Ensure content type is explicitly set
      }
    });
    return response.data.recomendados;
  } catch (error) {
    console.error('Erro ao obter recomendações do serviço ML:', error.response ? error.response.data : error.message);
    // Log more details if available, especially the status code
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      // Check for Cloudflare Ray ID in headers or body
      const rayId = error.response.headers['cf-ray'] || (typeof error.response.data === 'string' && error.response.data.includes('Cloudflare Ray ID:') ? error.response.data.substring(error.response.data.indexOf('Cloudflare Ray ID:') + 'Cloudflare Ray ID:'.length).trim() : 'N/A');
      console.error('Cloudflare Ray ID:', rayId);
    }
    throw new Error('Não foi possível obter recomendações.');
  }
}

module.exports = {
  getRecommendations,
};
