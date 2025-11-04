const { MongoClient, Db } = require('mongodb');
require('dotenv').config();

let client;
let db;

const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'musicdb';
    
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    db = client.db(dbName);
    
    console.log('✅ MongoDB Connected successfully');
    console.log('📅 Database:', dbName);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB Connection failed:', error.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
};

const closeConnection = async () => {
  if (client) {
    await client.close();
    console.log('📤 MongoDB connection closed');
  }
};

// Auto-connect on require
connectToMongoDB();

module.exports = {
  connectToMongoDB,
  getDB,
  closeConnection
};