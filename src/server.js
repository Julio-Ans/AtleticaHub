// src/server.js
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../config/swagger');
const authRoutes = require('./routes/authRoutes.js');
const path = require('path');
const firebaseCfg   = require('./config/firebaseClient');  // <-- aqui
const connectMongoDB = require('./config/mongodb');
const mensagemHtmlRoute = require('./routes/mensagemHtmlRoute');
const mensagemRoutes = require('./routes/mensagemRoutes');


const prisma = new PrismaClient();
const app = express();
connectMongoDB().then(() => {
  console.log('MongoDB conectado');

  // seu app.listen aqui
  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });
});

// 1. Forçar JSON em todas as requisições
app.use(express.json());

// Endpoint que serve a config do Firebase ao frontend
app.get('/config/firebase', (req, res) => {
  try {
    return res.status(200).json(firebaseCfg);
  } catch (err) {
    console.error('Erro ao enviar config Firebase:', err);
    return res.status(500).json({ error: 'Erro interno ao carregar config.' });
  }
});

app.use('/auth', authRoutes); // agora você tem /auth/register e /auth/login


// TESTE HTML - Servir arquivos estáticos (como HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));
// (Opcional) Redirecionar rota base para register.html
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});


///////////////////////////////////////////////////////////////////


// 🔁 Rota da API de mensagens
app.use('/api/mensagens', mensagemRoutes);

// ✅ Rota do HTML de teste
app.use('/mensagens', mensagemHtmlRoute);

// 2. Swagger JSON & UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3. Endpoints de Produtos
app.post('/api/produtos', async (req, res, next) => {
  try {
    const { nome, descricao, preco, estoque } = req.body;
    const produto = await prisma.produto.create({
      data: { nome, descricao, preco, estoque },
    });
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

// 4. Endpoints de Carrinho
app.post('/api/cart', async (req, res, next) => {
  try {
    const { studentEmail, produtoId, quantidade } = req.body;
    // ... lógica de validação e criação ...
    const cartItem = await prisma.cartItem.create({ data: { studentEmail, produtoId, quantidade }});
    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
});

app.get('/api/cart', async (req, res, next) => {
  try {
    const { studentEmail } = req.query;
    if (!studentEmail) return res.status(400).json({ error: 'studentEmail é obrigatório' });
    const items = await prisma.cartItem.findMany({ where: { studentEmail }, include: { produto: true }});
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// 5. Endpoints de Pedidos
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



// 6. Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 7. Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API rodando na porta ${PORT}`));
