const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;
let db;

const sanitizeUri = (uri) => (uri ? uri.replace(/(\/\/)(.*?:)(.*?)(@)/, '$1$2******$4') : '');

const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.DB_NAME || 'musicdb';

    console.log('🔍 MONGODB_URI (sanitized):', sanitizeUri(uri));
    console.log('🔍 DB_NAME:', dbName);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

    if (!uri) {
      console.error('❌ MONGODB_URI is not set');
      throw new Error('MONGODB_URI missing');
    }

    // Config recomendada para Atlas/Render (SRV + TLS)
    client = new MongoClient(uri, {
      // El driver v6 ya maneja SRV y TLS; explicitamos TLS por claridad
      tls: true,
      serverSelectionTimeoutMS: 20000,
      // retryWrites se maneja en la URI (?retryWrites=true)
    });

    console.log('🔄 Attempting MongoDB connection...');
    await client.connect();

    // Si la URI ya tiene /db, dbName puede ser redundante; aun así lo respetamos
    db = client.db(dbName);

    // Intento de ping para confirmar conectividad
    await db.command({ ping: 1 });
    console.log('✅ MongoDB connected and ping OK');

    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection failed:', error?.message || error);
    if (error?.cause) console.error('❌ [cause]:', error.cause);
    // Evitar restart loop en Render
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

connectToMongoDB().catch(() => {});

module.exports = { connectToMongoDB, getDB, closeConnection };