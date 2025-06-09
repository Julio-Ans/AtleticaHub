const { admin } = require('./src/config/firebaseAdmin');

async function checkAndCreateBucket() {
  try {
    console.log('🔍 Verificando configuração do Firebase Storage...\n');
    
    const bucketName = 'atleticahub-7b449.appspot.com';
    console.log(`📦 Bucket configurado: ${bucketName}`);
    
    // Tentar acessar o bucket
    const bucket = admin.storage().bucket(bucketName);
    
    try {
      console.log('🔍 Verificando se o bucket existe...');
      const [exists] = await bucket.exists();
      
      if (exists) {
        console.log('✅ Bucket existe e está acessível!');
        
        // Testar upload de um arquivo simples
        console.log('\n🧪 Testando upload...');
        const file = bucket.file('test/test.txt');
        await file.save('Este é um arquivo de teste', {
          metadata: {
            contentType: 'text/plain'
          }
        });
        console.log('✅ Upload de teste bem-sucedido!');
        
        // Limpar arquivo de teste
        await file.delete();
        console.log('🧹 Arquivo de teste removido');
        
      } else {
        console.log('❌ Bucket não existe');
        console.log('\n💡 Soluções possíveis:');
        console.log('1. Habilitar o Firebase Storage no console');
        console.log('2. Verificar se o projeto Firebase está correto');
        console.log('3. Verificar permissões da conta de serviço');
      }
      
    } catch (checkError) {
      console.error('❌ Erro ao verificar bucket:', checkError.message);
      
      if (checkError.message.includes('does not exist')) {
        console.log('\n💡 O bucket não existe. Possíveis causas:');
        console.log('1. Firebase Storage não foi habilitado no projeto');
        console.log('2. Nome do bucket está incorreto');
        console.log('3. Conta de serviço não tem permissões adequadas');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAndCreateBucket();
