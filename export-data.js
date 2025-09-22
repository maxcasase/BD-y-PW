const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const exportCollection = async (collectionName, fileName) => {
  const data = await mongoose.connection.db.collection(collectionName).find().toArray();
  fs.writeFileSync(`${fileName}.json`, JSON.stringify(data, null, 2));
  console.log(` ${collectionName} exportada a ${fileName}.json`);
};

// Exportar todas las colecciones
Promise.all([
  exportCollection('albums', 'albums'),
  exportCollection('artists', 'artists'),
  exportCollection('genres', 'genres'),
  exportCollection('users', 'users'),
  exportCollection('reviews', 'reviews')
]).then(() => {
  console.log(' Todos los datos exportados!');
  process.exit(0);
});