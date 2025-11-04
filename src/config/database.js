const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;
let db;

const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'musicdb';

    if (!uri) {
      console.error('❌ MONGODB_URI is not set');
      throw new Error('MONGODB_URI missing');
    }

    // Config recomendado para Atlas/Render
    client = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 15000,
    });

    console.log('🔄 Attempting MongoDB connection...');
    await client.connect();
    db = client.db(dbName);
    console.log('✅ MongoDB connected');
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection failed:', error?.message || error);
    // Evitar reinicio en bucle: no hacer process.exit
    throw error;
  }
};

const getDB = () => {
  if (!db) throw new Error('DB not initialized');
  return db;
};

const closeConnection = async () => {
  if (client) await client.close();
};

// Autoconectar
connectToMongoDB().catch(() => {});

module.exports = { connectToMongoDB, getDB, closeConnection };