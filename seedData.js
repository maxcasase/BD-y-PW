const mongoose = require('mongoose');
require('dotenv').config();

// Importar el index de modelos para registrar todos los modelos
require('./src/models/index');

// Obtener los modelos registrados
const Genre = mongoose.model('Genre');
const Artist = mongoose.model('Artist');
const Album = mongoose.model('Album');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Limpiar datos existentes
    await Genre.deleteMany();
    await Artist.deleteMany();
    await Album.deleteMany();

    // 1. Crear géneros
    const genres = await Genre.insertMany([
      { name: 'Rock', description: 'Música rock' },
      { name: 'Pop', description: 'Música pop' },
      { name: 'Jazz', description: 'Música jazz' },
      { name: 'Hip Hop', description: 'Hip hop y rap' },
      { name: 'Electrónica', description: 'Música electrónica' }
    ]);

    // 2. Crear artistas
    const artists = await Artist.insertMany([
      {
        name: 'Pink Floyd',
        bio: 'Banda británica de rock progresivo',
        genres: [genres[0]._id],
        image: 'https://i.scdn.co/image/ab6761610000e5ebc9690bc711d04b3d4fd4b87c'
      },
      {
        name: 'The Beatles',
        bio: 'Banda de rock inglesa',
        genres: [genres[0]._id, genres[1]._id],
        image: 'https://i.scdn.co/image/ab6761610000e5ebc9690bc711d04b3d4fd4b87c'
      },
      {
        name: 'Michael Jackson',
        bio: 'El rey del pop',
        genres: [genres[1]._id],
        image: 'https://i.scdn.co/image/ab6761610000e5ebc9690bc711d04b3d4fd4b87c'
      }
    ]);

    // 3. Crear álbumes
    const albums = await Album.insertMany([
      {
        title: 'The Dark Side of the Moon',
        artist: artists[0]._id,
        releaseYear: 1973,
        genre: genres[0]._id,
        coverImage: 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
        totalTracks: 10,
        duration: 2550
      },
      {
        title: 'Abbey Road',
        artist: artists[1]._id,
        releaseYear: 1969,
        genre: genres[0]._id,
        coverImage: 'https://i.scdn.co/image/ab67616d0000b2734ce8b4e42588bf18182a1ad2',
        totalTracks: 17,
        duration: 2874
      },
      {
        title: 'Thriller',
        artist: artists[2]._id,
        releaseYear: 1982,
        genre: genres[1]._id,
        coverImage: 'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778',
        totalTracks: 9,
        duration: 4218
      }
    ]);

    console.log(' Datos de prueba creados:');
    console.log(`   - ${genres.length} géneros`);
    console.log(`   - ${artists.length} artistas`);
    console.log(`   - ${albums.length} álbumes`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Ejecutar
connectDB().then(() => {
  seedData();
});