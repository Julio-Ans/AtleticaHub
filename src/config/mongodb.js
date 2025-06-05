const mongoose = require('mongoose');

async function connectMongoDB() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✅ MongoDB conectado com sucesso');
}

module.exports = connectMongoDB;
