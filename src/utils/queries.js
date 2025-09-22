const mongoose = require('mongoose');

const queries = {
  // 1. Obtener todos los álbumes con artistas y géneros populados
  getAllAlbums: async () => {
    return await mongoose.model('Album').find()
      .populate('artist', 'name image')
      .populate('genre', 'name')
      .sort({ createdAt: -1 });
  },

  // 2. Obtener álbumes por género
  getAlbumsByGenre: async (genreId) => {
    return await mongoose.model('Album').find({ genre: genreId })
      .populate('artist', 'name')
      .populate('genre', 'name');
  },

  // 3. Obtener álbumes por año de lanzamiento
  getAlbumsByYear: async (year) => {
    return await mongoose.model('Album').find({ releaseYear: year })
      .populate('artist', 'name')
      .sort({ title: 1 });
  },

  // 4. Buscar álbumes por título (búsqueda textual)
  searchAlbums: async (searchTerm) => {
    return await mongoose.model('Album').find(
      { $text: { $search: searchTerm } },
      { score: { $meta: 'textScore' } }
    )
    .populate('artist', 'name')
    .sort({ score: { $meta: 'textScore' } });
  },

  // 5. Obtener álbumes mejor calificados (rating > 8)
  getTopRatedAlbums: async () => {
    return await mongoose.model('Album').find({ averageRating: { $gt: 8 } })
      .populate('artist', 'name image')
      .sort({ averageRating: -1 });
  },

  // 6. Obtener artistas con sus álbumes
  getArtistsWithAlbums: async () => {
    return await mongoose.model('Artist').find()
      .populate('genres', 'name')
      .sort({ name: 1 });
  },

  // 7. Obtener reseñas de un álbum específico
  getAlbumReviews: async (albumId) => {
    return await mongoose.model('Review').find({ album: albumId })
      .populate('user', 'username profile')
      .sort({ createdAt: -1 });
  },

  // 8. Obtener usuarios con más reseñas
  getTopReviewers: async () => {
    return await mongoose.model('Review').aggregate([
      {
        $group: {
          _id: '$user',
          reviewCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.username': 1,
          'user.email': 1,
          reviewCount: 1
        }
      },
      {
        $sort: { reviewCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
  },

  // 9. Obtener estadísticas de géneros
  getGenreStats: async () => {
    return await mongoose.model('Album').aggregate([
      {
        $group: {
          _id: '$genre',
          albumCount: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: '_id',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $unwind: '$genre'
      },
      {
        $project: {
          'genre.name': 1,
          albumCount: 1,
          avgRating: { $round: ['$avgRating', 1] }
        }
      },
      {
        $sort: { albumCount: -1 }
      }
    ]);
  },

  // 10. Obtener listas públicas populares
  getPopularPublicLists: async () => {
    return await mongoose.model('List').find({ isPublic: true })
      .populate('creator', 'username profile')
      .populate('items.album', 'title artist coverImage')
      .sort({ likes: -1 })
      .limit(10);
  }
};

module.exports = queries;