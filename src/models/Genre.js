const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Genre {
  static getCollection() {
    return getDB().collection('genres');
  }

  static async create(genreData) {
    const genreDocument = {
      name: genreData.name,
      description: genreData.description || '',
      created_at: new Date()
    };

    const result = await this.getCollection().insertOne(genreDocument);
    return { _id: result.insertedId, ...genreDocument };
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.getCollection()
      .find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async findById(id) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.getCollection().findOne({ _id: objectId });
  }

  static async findByName(name) {
    return await this.getCollection().findOne({ name: name });
  }

  static async update(genreId, genreData) {
    const objectId = typeof genreId === 'string' ? new ObjectId(genreId) : genreId;
    
    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          name: genreData.name,
          description: genreData.description,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    return result.value !== null;
  }

  static async getGenreAlbums(genreId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const objectId = typeof genreId === 'string' ? new ObjectId(genreId) : genreId;
    
    return await getDB().collection('albums').aggregate([
      { $match: { genre_id: objectId } },
      {
        $lookup: {
          from: 'artists',
          localField: 'artist_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $addFields: {
          artist_name: { $arrayElemAt: ['$artist.name', 0] }
        }
      },
      {
        $project: {
          artist: 0
        }
      },
      {
        $sort: {
          average_rating: -1,
          release_year: -1
        }
      },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async getGenreStats(genreId) {
    const objectId = typeof genreId === 'string' ? new ObjectId(genreId) : genreId;
    
    const stats = await getDB().collection('albums').aggregate([
      { $match: { genre_id: objectId } },
      {
        $group: {
          _id: null,
          albums_count: { $sum: 1 },
          artists_count: { $addToSet: '$artist_id' },
          avg_rating: {
            $avg: {
              $cond: {
                if: { $gt: ['$average_rating', 0] },
                then: '$average_rating',
                else: '$$REMOVE'
              }
            }
          }
        }
      },
      {
        $addFields: {
          artists_count: { $size: '$artists_count' }
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        albums_count: 0,
        artists_count: 0,
        average_rating: 0
      };
    }

    return {
      albums_count: stats[0].albums_count,
      artists_count: stats[0].artists_count,
      average_rating: parseFloat(stats[0].avg_rating || 0)
    };
  }

  static async getPopularGenres(limit = 10) {
    return await this.getCollection().aggregate([
      {
        $lookup: {
          from: 'albums',
          localField: '_id',
          foreignField: 'genre_id',
          as: 'albums'
        }
      },
      {
        $addFields: {
          albums_count: { $size: '$albums' }
        }
      },
      {
        $match: {
          albums_count: { $gt: 0 }
        }
      },
      {
        $project: {
          albums: 0
        }
      },
      {
        $sort: {
          albums_count: -1
        }
      },
      { $limit: limit }
    ]).toArray();
  }

  static async search(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.getCollection()
      .find({ 
        name: { $regex: query, $options: 'i' } 
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async deleteGenre(genreId) {
    const objectId = typeof genreId === 'string' ? new ObjectId(genreId) : genreId;
    
    const result = await this.getCollection().deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }
}

module.exports = Genre;