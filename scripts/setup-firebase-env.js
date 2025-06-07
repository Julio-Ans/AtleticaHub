#!/usr/bin/env node

/**
 * Script para configurar as credenciais do Firebase para produção
 * Usage: node scripts/setup-firebase-env.js path/to/firebase-service-account.json
 */

const fs = require('fs');
const path = require('path');

function setupFirebaseEnv(serviceAccountPath) {
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`❌ Arquivo não encontrado: ${serviceAccountPath}`);
      process.exit(1);
    }

    // Lê e valida o arquivo JSON
    const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Validação básica
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
      process.exit(1);
    }

    // Minifica o JSON (remove espaços e quebras de linha)
    const minifiedJson = JSON.stringify(serviceAccount);

    // Cria ou atualiza o arquivo .env
    const envPath = path.resolve(__dirname, '..', '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Remove linha existente do FIREBASE_SERVICE_ACCOUNT se houver
    envContent = envContent.replace(/^FIREBASE_SERVICE_ACCOUNT=.*$/m, '');

    // Adiciona a nova configuração
    envContent += `\nFIREBASE_SERVICE_ACCOUNT=${minifiedJson}\n`;

    // Remove linhas vazias extras
    envContent = envContent.replace(/\n\n+/g, '\n\n').trim() + '\n';

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Credenciais do Firebase configuradas com sucesso!');
    console.log(`📁 Projeto: ${serviceAccount.project_id}`);
    console.log(`📧 Email: ${serviceAccount.client_email}`);
    console.log('');
    console.log('🚀 Agora você pode fazer deploy da aplicação!');

  } catch (error) {
    console.error('❌ Erro ao configurar credenciais:', error.message);
    process.exit(1);
  }
}

// Execução do script
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📋 Uso: node scripts/setup-firebase-env.js <caminho-para-service-account.json>');
  console.log('');
  console.log('Exemplo:');
  console.log('  node scripts/setup-firebase-env.js src/config/firebase-service-account.json');
  process.exit(1);
}

setupFirebaseEnv(args[0]);
