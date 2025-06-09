#!/usr/bin/env node

/**
 * Script para validar as configurações do Firebase
 * Usage: node scripts/validate-firebase.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

function validateFirebaseConfig() {
  console.log('🔍 Validando configurações do Firebase...\n');

  // Verificar ambiente
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`📍 Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'}`);

  if (isProduction) {
    // Validar variável de ambiente
    console.log('🌐 Verificando variáveis de ambiente...');
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT não definida nas variáveis de ambiente');
      return false;
    }

    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter(field => !serviceAccount[field]);
      
      if (missingFields.length > 0) {
        console.error(`❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
        return false;
      }

      console.log('✅ Variáveis de ambiente válidas');
      console.log(`📁 Projeto: ${serviceAccount.project_id}`);
      console.log(`📧 Email: ${serviceAccount.client_email}`);
      
    } catch (error) {
      console.error('❌ Erro ao fazer parse das credenciais:', error.message);
      return false;
    }

  } else {
    // Validar arquivo local
    console.log('📁 Verificando arquivo de credenciais local...');
    
    const serviceAccountPath = path.resolve(__dirname, '..', 'src', 'config', 'firebase-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`❌ Arquivo não encontrado: ${serviceAccountPath}`);
      console.log('💡 Dica: Baixe o arquivo de credenciais do Firebase Console');
      return false;
    }

    try {
      const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf-8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
      const missingFields = requiredFields.filter(field => !serviceAccount[field]);
      
      if (missingFields.length > 0) {
        console.error(`❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
        return false;
      }

      console.log('✅ Arquivo de credenciais válido');
      console.log(`📁 Projeto: ${serviceAccount.project_id}`);
      console.log(`📧 Email: ${serviceAccount.client_email}`);
      
    } catch (error) {
      console.error('❌ Erro ao ler arquivo de credenciais:', error.message);
      return false;
    }
  }
  // Validar outras variáveis de ambiente importantes
  console.log('\n🔐 Verificando outras configurações...');
  
  const requiredEnvVars = ['DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error(`❌ Variáveis de ambiente ausentes: ${missingEnvVars.join(', ')}`);
    return false;
  }

  console.log('✅ Todas as configurações estão válidas!');
  console.log('\n🚀 Sistema pronto para iniciar!');
  
  return true;
}

// Execução do script
if (!validateFirebaseConfig()) {
  process.exit(1);
}
