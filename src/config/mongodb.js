const mongoose = require('mongoose');

async function connectMongoDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB conectado com sucesso');
}

module.exports = connectMongoDB;
