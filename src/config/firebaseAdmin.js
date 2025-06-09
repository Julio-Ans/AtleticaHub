const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Configuração do Firebase Admin baseada no ambiente

let serviceAccount;

try {
  if (process.env.NODE_ENV === 'production' && process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Em produção, carrega das variáveis de ambiente
    console.log('Carregando credenciais do Firebase das variáveis de ambiente...');
    
    // Tenta fazer parse direto da string JSON
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (parseError) {
      console.error('Erro ao fazer parse das credenciais do Firebase:', parseError.message);
      throw new Error('Credenciais do Firebase inválidas nas variáveis de ambiente');
    }
  } else {
    // Em desenvolvimento, lê do arquivo local
    console.log('Carregando credenciais do Firebase do arquivo local...');
    const serviceAccountPath = path.resolve(__dirname, "firebase-service-account.json");
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Arquivo de credenciais não encontrado: ${serviceAccountPath}`);
    }
    
    serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf-8")
    );
  }
  
  // Validação básica das credenciais
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Credenciais do Firebase incompletas. Verifique project_id, private_key e client_email.');
  }
  
  console.log(`Firebase configurado para o projeto: ${serviceAccount.project_id}`);
  
} catch (error) {
  console.error('Erro ao carregar credenciais do Firebase:', error.message);
  process.exit(1);
}
 

// Inicialização do Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://atleticahub-7b449-default-rtdb.firebaseio.com/",
    storageBucket: "atleticahub-7b449.firebasestorage.app"
  });
  
  console.log('Firebase Admin inicializado com sucesso!');
} catch (initError) {
  console.error('Erro ao inicializar Firebase Admin:', initError.message);
  process.exit(1);
}

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };

