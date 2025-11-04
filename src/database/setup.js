const { getDB, connectToMongoDB } = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🚀 Starting MongoDB setup...');
    
    // Asegurar conexión
    await connectToMongoDB();
    const db = getDB();

    console.log('📦 Creating collections and indices...');

    // Crear índices para users
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('✅ Users indices created');

    // Crear índices para artists
    await db.collection('artists').createIndex({ name: 1 }, { unique: true });
    await db.collection('artists').createIndex({ name: "text" });
    console.log('✅ Artists indices created');

    // Crear índices para genres
    await db.collection('genres').createIndex({ name: 1 }, { unique: true });
    await db.collection('genres').createIndex({ name: "text" });
    console.log('✅ Genres indices created');

    // Crear índices para albums
    await db.collection('albums').createIndex({ artist_id: 1 });
    await db.collection('albums').createIndex({ genre_id: 1 });
    await db.collection('albums').createIndex({ discogs_release_id: 1 });
    await db.collection('albums').createIndex({ title: "text" });
    await db.collection('albums').createIndex({ average_rating: -1 });
    await db.collection('albums').createIndex({ created_at: -1 });
    console.log('✅ Albums indices created');

    // Crear índices para reviews
    await db.collection('reviews').createIndex({ user_id: 1, album_id: 1 }, { unique: true });
    await db.collection('reviews').createIndex({ album_id: 1 });
    await db.collection('reviews').createIndex({ user_id: 1 });
    await db.collection('reviews').createIndex({ created_at: -1 });
    await db.collection('reviews').createIndex({ rating: -1 });
    console.log('✅ Reviews indices created');

    // Insertar datos básicos de géneros
    const genres = [
      { name: 'Rock', description: 'Música rock' },
      { name: 'Pop', description: 'Música pop' },
      { name: 'Jazz', description: 'Música jazz' },
      { name: 'Hip Hop', description: 'Hip hop y rap' },
      { name: 'Electrónica', description: 'Música electrónica' }
    ];

    for (const genre of genres) {
      await db.collection('genres').updateOne(
        { name: genre.name },
        { 
          $setOnInsert: { 
            ...genre, 
            created_at: new Date() 
          } 
        },
        { upsert: true }
      );
    }
    console.log('✅ Basic genres inserted');

    // Insertar artistas básicos
    const artists = [
      { name: 'The Beatles', bio: 'Banda inglesa de rock' },
      { name: 'Pink Floyd', bio: 'Banda británica de rock progresivo' },
      { name: 'Michael Jackson', bio: 'El rey del pop' }
    ];

    for (const artist of artists) {
      await db.collection('artists').updateOne(
        { name: artist.name },
        { 
          $setOnInsert: { 
            ...artist, 
            image_url: '',
            created_at: new Date() 
          } 
        },
        { upsert: true }
      );
    }
    console.log('✅ Basic artists inserted');

    // Insertar álbumes demo
    const beatles = await db.collection('artists').findOne({ name: 'The Beatles' });
    const pinkFloyd = await db.collection('artists').findOne({ name: 'Pink Floyd' });
    const mjackson = await db.collection('artists').findOne({ name: 'Michael Jackson' });
    const rockGenre = await db.collection('genres').findOne({ name: 'Rock' });
    const popGenre = await db.collection('genres').findOne({ name: 'Pop' });

    const albums = [
      {
        title: 'Abbey Road',
        artist_id: beatles._id,
        release_year: 1969,
        genre_id: rockGenre._id,
        cover_image: 'https://via.placeholder.com/300x300?text=Abbey+Road',
        total_tracks: 17,
        duration: 2869,
        average_rating: 0.00,
        total_ratings: 0,
        created_at: new Date()
      },
      {
        title: 'The Dark Side of the Moon',
        artist_id: pinkFloyd._id,
        release_year: 1973,
        genre_id: rockGenre._id,
        cover_image: 'https://via.placeholder.com/300x300?text=Dark+Side+Moon',
        total_tracks: 10,
        duration: 2580,
        average_rating: 0.00,
        total_ratings: 0,
        created_at: new Date()
      },
      {
        title: 'Thriller',
        artist_id: mjackson._id,
        release_year: 1982,
        genre_id: popGenre._id,
        cover_image: 'https://via.placeholder.com/300x300?text=Thriller',
        total_tracks: 9,
        duration: 2535,
        average_rating: 0.00,
        total_ratings: 0,
        created_at: new Date()
      }
    ];

    for (const album of albums) {
      await db.collection('albums').updateOne(
        { title: album.title, artist_id: album.artist_id },
        { $setOnInsert: album },
        { upsert: true }
      );
    }
    console.log('✅ Sample albums inserted');

    console.log('🎉 MongoDB setup completed!');
    console.log('📊 Collections created: users, artists, genres, albums, reviews');
    console.log('🔍 Indices optimized for queries');
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = setupDatabase;