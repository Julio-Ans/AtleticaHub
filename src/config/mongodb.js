const mongoose = require('mongoose');

async function connectMongoDB() {
  await mongoose.connect(process.env.MONGODB_URI);
}

module.exports = connectMongoDB;
