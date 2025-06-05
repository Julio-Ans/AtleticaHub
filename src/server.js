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

const app = express();
const prisma = new PrismaClient();

connectMongoDB().then(() => {
  console.log('🍃 MongoDB conectado com sucesso!');
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

// 📚 Swagger Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🛒 Produtos
const produtoRoutes = require('./routes/produtosRoutes');
app.use('/api/produtos', produtoRoutes);

// 🛍 Carrinho
const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

// Pedidos
const pedidosRoutes = require('./routes/pedidosRoutes'); // ajuste o caminho se for diferente
app.use('/api/pedidos', pedidosRoutes);


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

