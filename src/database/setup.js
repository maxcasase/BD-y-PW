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
     CREATE TABLE generos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE artistas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL UNIQUE,
        biografia TEXT,
        url_imagen VARCHAR(500),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE albumes (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(300) NOT NULL,
        artista_id INTEGER REFERENCES artistas(id) ON DELETE CASCADE,
        año_lanzamiento INTEGER NOT NULL,
        genero_id INTEGER REFERENCES generos(id) ON DELETE CASCADE,
        url_portada VARCHAR(500),
        total_canciones INTEGER DEFAULT 0,
        duracion_total INTEGER DEFAULT 0,
        calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
        total_calificaciones INTEGER DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
        correo_electronico VARCHAR(100) UNIQUE NOT NULL,
        hash_contrasena VARCHAR(255) NOT NULL,
        nombre_perfil VARCHAR(100),
        biografia TEXT,
        url_avatar VARCHAR(500),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE reseñas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albumes(id) ON DELETE CASCADE,
        calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 10),
        titulo VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (usuario_id, album_id)
    );

    -- Índices para mejorar el rendimiento
    CREATE INDEX idx_albumes_artista ON albumes(artista_id);
    CREATE INDEX idx_albumes_genero ON albumes(genero_id);
    CREATE INDEX idx_reseñas_album ON reseñas(album_id);
    CREATE INDEX idx_reseñas_usuario ON reseñas(usuario_id);

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

if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = setupDatabase;
