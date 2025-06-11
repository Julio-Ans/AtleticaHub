require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/swagger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const firebaseCfg = require('./config/firebaseClient');
const connectMongoDB = require('./config/mongodb');

const mensagemRoutes = require('./routes/mensagemRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const esporteRoutes = require('./routes/esporteRoutes');
const eventRoutes = require('./routes/eventRoutes');
const produtoRoutes = require('./routes/produtosRoutes');
const cartRoutes = require('./routes/cartRoutes');
const pedidoRoutes = require('./routes/pedidosRoutes');

// Importar rotas de autenticação
const authRoutes = require('./routes/authRoutes');
const verificarToken = require('./middlewares/verificarToken');

const app = express();

connectMongoDB().then(() => {
  console.log('🍃 MongoDB conectado com sucesso!');
});

// Configuração CORS simplificada para produção
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL,
  'https://aletica-hub-etya.vercel.app'
].filter(Boolean);

console.log('🌐 CORS - Origens permitidas:', allowedOrigins);

// CORS simplificado - o problema pode estar na complexidade da configuração
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Servir arquivos de upload de imagens de eventos
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Firebase Config para frontend
app.get('/config/firebase', (req, res) => {
  try {
    res.status(200).json(firebaseCfg);
  } catch (err) {
    console.error('Erro ao enviar config Firebase:', err);
    res.status(500).json({ error: 'Erro interno ao carregar config.' });
  }
});

// Rota para testar se o CORS está funcionando corretamente
app.get('/api/cors-test', (req, res) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL,
    'https://aletica-hub-etya.vercel.app'
  ].filter(Boolean);

  res.json({
    message: 'Conexão CORS bem-sucedida!',
    origin: req.headers.origin || 'Origem não detectada',
    allowedOrigins: allowedOrigins,
    corsHeaders: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota específica para testar middlewares em produção
app.get('/api/middleware-test', (req, res) => {
  console.log('🧪 [MIDDLEWARE-TEST] Testando middleware chain');
  console.log('🧪 [MIDDLEWARE-TEST] Headers:', req.headers);
  
  res.json({
    message: 'Middleware test - sem autenticação',
    headers: req.headers,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Rota para testar middleware de autenticação especificamente
app.get('/api/auth-middleware-test', verificarToken, (req, res) => {
  console.log('🧪 [AUTH-MIDDLEWARE-TEST] req.user:', req.user);
  
  res.json({
    message: 'Middleware de autenticação funcionando',
    user: req.user,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// 📄 Rotas HTML públicas de teste e dashboard
app.use(express.static(path.join(__dirname, '../public')));

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-dashboard.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/user-dashboard.html'));
});

// 🏆 API Routes
app.use('/api/esportes', esporteRoutes);
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/eventos', eventRoutes);

// 📚 Swagger Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🛒 Produtos (já declarado no topo do arquivo)
app.use('/api/produtos', produtoRoutes);

// 🛍 Carrinho (já declarado no topo do arquivo)
app.use('/api/cart', cartRoutes);

// Pedidos (já declarado no topo do arquivo)
app.use('/api/pedidos', pedidoRoutes);

// 🧯 Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 🚀 Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));

