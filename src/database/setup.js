const { query, getClient } = require('../config/database');

async function setupDatabase() {
  const client = await getClient();
  
  try {
    console.log('🚀 Starting database setup for Render PostgreSQL...');

    // PRIMERO eliminar tablas existentes (en orden inverso por dependencias)
    const dropTablesSQL = `
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS albums CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS artists CASCADE;
      DROP TABLE IF EXISTS genres CASCADE;
    `;

    await client.query(dropTablesSQL);
    console.log('✅ Old tables dropped successfully');

    // LUEGO crear tablas nuevas
    const setupSQL = `
      CREATE TABLE genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL UNIQUE,
        bio TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
        release_year INTEGER NOT NULL,
        genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
        cover_image VARCHAR(500),
        total_tracks INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        average_rating DECIMAL(4,2) DEFAULT 0.00,
        total_ratings INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_name VARCHAR(100),
        bio TEXT,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, album_id)
      );

      CREATE INDEX idx_albums_artist ON albums(artist_id);
      CREATE INDEX idx_albums_genre ON albums(genre_id);
      CREATE INDEX idx_reviews_album ON reviews(album_id);
      CREATE INDEX idx_reviews_user ON reviews(user_id);
    `;

    await client.query(setupSQL);
    console.log('✅ Database tables created successfully');

    // Insertar datos básicos
    await client.query(`
      INSERT INTO genres (name, description) VALUES 
      ('Rock', 'Música rock'),
      ('Pop', 'Música pop'),
      ('Jazz', 'Música jazz'),
      ('Hip Hop', 'Hip hop y rap'),
      ('Electrónica', 'Música electrónica')
      ON CONFLICT (name) DO NOTHING;

      INSERT INTO artists (name, bio) VALUES 
      ('The Beatles', 'Banda inglesa de rock'),
      ('Pink Floyd', 'Banda británica de rock progresivo'),
      ('Michael Jackson', 'El rey del pop')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Basic data inserted successfully');

    // Insertar álbumes demo con FK válidas
    await client.query(`
      WITH beatles AS (SELECT id AS artist_id FROM artists WHERE name='The Beatles' LIMIT 1),
           pfloyd  AS (SELECT id AS artist_id FROM artists WHERE name='Pink Floyd' LIMIT 1),
           mjackson AS (SELECT id AS artist_id FROM artists WHERE name='Michael Jackson' LIMIT 1),
           rock    AS (SELECT id AS genre_id  FROM genres  WHERE name='Rock' LIMIT 1),
           pop     AS (SELECT id AS genre_id  FROM genres  WHERE name='Pop' LIMIT 1)
      INSERT INTO albums (title, artist_id, release_year, genre_id, cover_image, total_tracks, duration) VALUES 
      (
        'Abbey Road', 
        (SELECT artist_id FROM beatles), 
        1969, 
        (SELECT genre_id FROM rock), 
        'https://via.placeholder.com/300x300?text=Abbey+Road', 
        17, 
        2869
      ),
      (
        'The Dark Side of the Moon', 
        (SELECT artist_id FROM pfloyd), 
        1973, 
        (SELECT genre_id FROM rock), 
        'https://via.placeholder.com/300x300?text=Dark+Side+Moon', 
        10, 
        2580
      ),
      (
        'Thriller', 
        (SELECT artist_id FROM mjackson), 
        1982, 
        (SELECT genre_id FROM pop), 
        'https://via.placeholder.com/300x300?text=Thriller', 
        9, 
        2535
      )
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Sample albums inserted successfully');
    console.log('🎉 Database setup completed on Render!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    client.release();
  }
}

if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = setupDatabase;