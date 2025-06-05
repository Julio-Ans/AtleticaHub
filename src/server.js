require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/swagger');

const firebaseCfg = require('./config/firebaseClient');
const connectMongoDB = require('./config/mongodb');

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const mensagemRoutes = require('./routes/mensagemRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const esporteRoutes = require('./routes/esporteRoutes'); // Nova importação
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const prisma = new PrismaClient();

connectMongoDB().then(() => {
  console.log('🍃 MongoDB conectado com sucesso!');
});

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

// Auth + Protected Routes
app.use('/auth', authRoutes);
app.use('/auth', protectedRoutes);

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
app.use('/api/esportes', esporteRoutes);        // Nova rota de Esportes
app.use('/api/inscricoes', inscricaoRoutes);    // Rota existente
app.use('/api/mensagens', mensagemRoutes);      // Rota existente
app.use('/api/eventos', eventRoutes);          // Nova rota de Eventos

// 📚 Swagger Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🛒 Produtos
app.post('/api/produtos', async (req, res, next) => {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const produto = await prisma.produto.create({ data: { nome, descricao, preco, estoque } });
    res.status(201).json(produto);
  } catch (err) {
    next(err);
  }
});

app.get('/api/produtos', async (req, res, next) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (err) {
    next(err);
  }
});

// 🛍 Carrinho
app.post('/api/cart', async (req, res, next) => {
  try {
    const { studentEmail, produtoId, quantidade } = req.body;
    const cartItem = await prisma.cartItem.create({ data: { studentEmail, produtoId, quantidade } });
    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
});

app.get('/api/cart', async (req, res, next) => {
  try {
    const { studentEmail } = req.query;
    if (!studentEmail) return res.status(400).json({ error: 'studentEmail é obrigatório' });
    const items = await prisma.cartItem.findMany({ where: { studentEmail }, include: { produto: true } });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// 📦 Pedidos
app.get('/api/pedidos', async (req, res, next) => {
  try {
    const { studentEmail } = req.query;
    if (!studentEmail) return res.status(400).json({ error: 'studentEmail é obrigatório' });
    const pedidos = await prisma.pedido.findMany({ where: { studentEmail } });
    res.json(pedidos);
  } catch (err) {
    next(err);
  }
});

app.post('/api/pedidos/:id/payment', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const pedido = await prisma.pedido.update({ where: { id }, data: { status: 'pago' } });
    res.json({ message: 'Pagamento processado', pedido });
  } catch (err) {
    next(err);
  }
});

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

