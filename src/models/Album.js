const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Album {
  static getCollection() {
    return getDB().collection('albums');
  }

  static async create(albumData) {
    const albumDocument = {
      title: albumData.title,
      artist_id: typeof albumData.artist_id === 'string' ? new ObjectId(albumData.artist_id) : albumData.artist_id,
      release_year: albumData.release_year,
      genre_id: typeof albumData.genre_id === 'string' ? new ObjectId(albumData.genre_id) : albumData.genre_id,
      cover_image: albumData.cover_image,
      discogs_release_id: albumData.discogs_release_id || null,
      total_tracks: albumData.total_tracks || 0,
      duration: albumData.duration || 0,
      average_rating: 0.00,
      total_ratings: 0,
      created_at: new Date()
    };

    const result = await this.getCollection().insertOne(albumDocument);
    return { _id: result.insertedId, ...albumDocument };
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.getCollection().aggregate([
      {
        $lookup: {
          from: 'artists',
          localField: 'artist_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'genre_id',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $addFields: {
          artist_name: { $arrayElemAt: ['$artist.name', 0] },
          genre_name: { $arrayElemAt: ['$genre.name', 0] }
        }
      },
      {
        $project: {
          artist: 0,
          genre: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async findById(id) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await this.getCollection().aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'artists',
          localField: 'artist_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'genre_id',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $addFields: {
          artist_name: { $arrayElemAt: ['$artist.name', 0] },
          genre_name: { $arrayElemAt: ['$genre.name', 0] }
        }
      },
      {
        $project: {
          artist: 0,
          genre: 0
        }
      }
    ]).toArray();

    return result[0] || null;
  }

  static async search(queryText, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.getCollection().aggregate([
      {
        $lookup: {
          from: 'artists',
          localField: 'artist_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'genre_id',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $addFields: {
          artist_name: { $arrayElemAt: ['$artist.name', 0] },
          genre_name: { $arrayElemAt: ['$genre.name', 0] }
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: queryText, $options: 'i' } },
            { artist_name: { $regex: queryText, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          artist: 0,
          genre: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async updateRating(albumId, newRating, totalRatings) {
    const objectId = typeof albumId === 'string' ? new ObjectId(albumId) : albumId;
    
    await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          average_rating: newRating,
          total_ratings: totalRatings,
          updated_at: new Date()
        }
      }
    );
  }
}

module.exports = Album;