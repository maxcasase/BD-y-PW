const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bdpw';

async function connectMongoDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

module.exports = connectMongoDB;
