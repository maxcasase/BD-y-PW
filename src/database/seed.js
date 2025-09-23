const { pool } = require('../config/database');

async function seedDatabase() {
  try {
    // Datos de prueba
    const genres = [
      { name: 'Rock', description: 'Música rock' },
      { name: 'Pop', description: 'Música pop' },
      { name: 'Jazz', description: 'Música jazz' },
      { name: 'Hip Hop', description: 'Hip hop y rap' },
      { name: 'Electrónica', description: 'Música electrónica' }
    ];

    const artists = [
      { name: 'Pink Floyd', bio: 'Banda británica de rock progresivo' },
      { name: 'The Beatles', bio: 'Banda de rock inglesa' },
      { name: 'Michael Jackson', bio: 'El rey del pop' }
    ];

    // Insertar géneros
    for (const genre of genres) {
      await pool.execute(
        'INSERT INTO genres (name, description) VALUES (?, ?)',
        [genre.name, genre.description]
      );
    }

    // Insertar artistas
    for (const artist of artists) {
      await pool.execute(
        'INSERT INTO artists (name, bio) VALUES (?, ?)',
        [artist.name, artist.bio]
      );
    }

    console.log('✅ Datos de prueba insertados correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error insertando datos:', error);
    process.exit(1);
  }
}

seedDatabase();