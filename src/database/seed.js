const { getDB, connectToMongoDB } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting MongoDB seeding...');
    
    await connectToMongoDB();
    const db = getDB();

    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'admin',
        email: 'admin@musicapp.com',
        password_hash: hashedPassword,
        profile_name: 'Administrator',
        bio: 'Administrador de la plataforma musical',
        avatar_url: 'https://via.placeholder.com/150x150?text=Admin',
        created_at: new Date()
      },
      {
        username: 'musiclover',
        email: 'user@musicapp.com',
        password_hash: hashedPassword,
        profile_name: 'Music Lover',
        bio: 'Amante de la música en todos sus géneros',
        avatar_url: 'https://via.placeholder.com/150x150?text=User',
        created_at: new Date()
      }
    ];

    for (const user of users) {
      await db.collection('users').updateOne(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true }
      );
    }
    console.log('✅ Demo users created');

    // Obtener IDs para crear reviews
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    const musicUser = await db.collection('users').findOne({ username: 'musiclover' });
    
    const abbeyRoad = await db.collection('albums').findOne({ title: 'Abbey Road' });
    const darkSide = await db.collection('albums').findOne({ title: 'The Dark Side of the Moon' });
    const thriller = await db.collection('albums').findOne({ title: 'Thriller' });

    // Crear reviews de ejemplo
    if (adminUser && musicUser && abbeyRoad && darkSide && thriller) {
      const reviews = [
        {
          user_id: adminUser._id,
          album_id: abbeyRoad._id,
          rating: 9,
          title: 'Una obra maestra del rock',
          content: 'Abbey Road representa uno de los mejores trabajos de The Beatles. La producción es impecable y las canciones fluyen perfectamente de una a otra.',
          likes_count: 12,
          dislikes_count: 1,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        {
          user_id: musicUser._id,
          album_id: darkSide._id,
          rating: 10,
          title: 'Perfection musical',
          content: 'The Dark Side of the Moon es simplemente perfecto. Cada nota, cada efecto de sonido, cada transición... Pink Floyd creó algo único e irrepetible.',
          likes_count: 25,
          dislikes_count: 0,
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-20')
        },
        {
          user_id: adminUser._id,
          album_id: thriller._id,
          rating: 8,
          title: 'El rey del pop en su máximo esplendor',
          content: 'Thriller demostró que Michael Jackson era mucho más que un artista pop. La diversidad musical y la calidad de producción siguen siendo referencias hoy día.',
          likes_count: 18,
          dislikes_count: 2,
          created_at: new Date('2024-02-01'),
          updated_at: new Date('2024-02-01')
        },
        {
          user_id: musicUser._id,
          album_id: abbeyRoad._id,
          rating: 8,
          title: 'Clásico atemporal',
          content: 'Un álbum que nunca pasa de moda. Come Together y Here Comes The Sun son himnos que perdurarán para siempre.',
          likes_count: 7,
          dislikes_count: 0,
          created_at: new Date('2024-02-10'),
          updated_at: new Date('2024-02-10')
        }
      ];

      for (const review of reviews) {
        await db.collection('reviews').updateOne(
          { user_id: review.user_id, album_id: review.album_id },
          { $setOnInsert: review },
          { upsert: true }
        );
      }
      console.log('✅ Demo reviews created');

      // Actualizar ratings de álbumes
      console.log('🔄 Updating album ratings...');
      
      // Abbey Road (ratings: 9, 8) = average 8.5, total 2
      await db.collection('albums').updateOne(
        { _id: abbeyRoad._id },
        { 
          $set: { 
            average_rating: 8.5, 
            total_ratings: 2,
            updated_at: new Date()
          } 
        }
      );

      // Dark Side (rating: 10) = average 10, total 1
      await db.collection('albums').updateOne(
        { _id: darkSide._id },
        { 
          $set: { 
            average_rating: 10.0, 
            total_ratings: 1,
            updated_at: new Date()
          } 
        }
      );

      // Thriller (rating: 8) = average 8, total 1
      await db.collection('albums').updateOne(
        { _id: thriller._id },
        { 
          $set: { 
            average_rating: 8.0, 
            total_ratings: 1,
            updated_at: new Date()
          } 
        }
      );

      console.log('✅ Album ratings updated');
    }

    console.log('🎉 MongoDB seeding completed!');
    console.log('📊 Database ready with sample data');
    
  } catch (error) {
    console.error('❌ MongoDB seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;