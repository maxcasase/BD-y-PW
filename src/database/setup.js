const { query, getClient } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const client = await getClient();
  
  try {
    console.log('🚀 Starting database setup for Render PostgreSQL...');

    // Crear tablas
    const setupSQL = `
      CREATE TABLE IF NOT EXISTS genres (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        bio TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        artist_id INTEGER REFERENCES artists(id) ON DELETE CASCADE,
        release_year INTEGER NOT NULL,
        genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
        cover_image VARCHAR(500),
        total_tracks INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        total_ratings INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_name VARCHAR(100),
        bio TEXT,
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
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

      CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist_id);
      CREATE INDEX IF NOT EXISTS idx_albums_genre ON albums(genre_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_album ON reviews(album_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
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
      ('Pink Floyd', 'Banda británica de rock progresivo'),
      ('The Beatles', 'Banda de rock inglesa'),
      ('Michael Jackson', 'El rey del pop')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Sample data inserted successfully');
    console.log('🎉 Database setup completed on Render!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    client.release();
  }
}

// Solo ejecutar si es el módulo principal
if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = setupDatabase;
