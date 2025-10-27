const { pool } = require('../config/database');

async function seedDatabase() {
  const client = await pool.connect();

  try {
    // Datos de prueba
    await client.query('BEGIN');

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
    const insertGenreSQL =
      'INSERT INTO genres (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING';
    for (const genre of genres) {
      await pool.execute(
        'INSERT INTO genres (name, description) VALUES (?, ?)',
        [genre.name, genre.description]
      );
      await client.query(insertGenreSQL, [genre.name, genre.description]);
    }

    // Insertar artistas
    const insertArtistSQL =
      'INSERT INTO artists (name, bio) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING';
    for (const artist of artists) {
      await pool.execute(
        'INSERT INTO artists (name, bio) VALUES (?, ?)',
        [artist.name, artist.bio]
      );
      await client.query(insertArtistSQL, [artist.name, artist.bio]);
    }

    console.log('✅ Datos de prueba insertados correctamente');
    process.exit(0);
    await client.query('COMMIT');
  } catch (error) {
    console.error('❌ Error insertando datos:', error);
    process.exit(1);
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

seedDatabase();
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Datos de prueba insertados correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error insertando datos:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
