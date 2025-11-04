const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Artist {
  static getCollection() {
    return getDB().collection('artists');
  }

  static async create(artistData) {
    const artistDocument = {
      name: artistData.name,
      bio: artistData.bio || '',
      image_url: artistData.image_url || '',
      created_at: new Date()
    };

    const result = await this.getCollection().insertOne(artistDocument);
    return { _id: result.insertedId, ...artistDocument };
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

  static async update(artistId, artistData) {
    const objectId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId;
    
    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          name: artistData.name,
          bio: artistData.bio,
          image_url: artistData.image_url,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    return result.value !== null;
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

  static async getArtistAlbums(artistId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const objectId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId;
    
    return await getDB().collection('albums').aggregate([
      { $match: { artist_id: objectId } },
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
          genre_name: { $arrayElemAt: ['$genre.name', 0] }
        }
      },
      {
        $project: {
          genre: 0
        }
      },
      { $sort: { release_year: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async getArtistStats(artistId) {
    const objectId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId;
    
    const stats = await getDB().collection('albums').aggregate([
      { $match: { artist_id: objectId } },
      {
        $group: {
          _id: null,
          albums_count: { $sum: 1 },
          avg_rating: { $avg: '$average_rating' },
          total_ratings: { $sum: '$total_ratings' }
        }
      }
    ]).toArray();

    if (stats.length === 0) {
      return {
        albums_count: 0,
        average_rating: 0,
        total_ratings: 0
      };
    }

    return {
      albums_count: stats[0].albums_count,
      average_rating: parseFloat(stats[0].avg_rating || 0),
      total_ratings: stats[0].total_ratings
    };
  }

  static async getTopArtists(limit = 10) {
    return await this.getCollection().aggregate([
      {
        $lookup: {
          from: 'albums',
          localField: '_id',
          foreignField: 'artist_id',
          as: 'albums'
        }
      },
      {
        $addFields: {
          albums_count: { $size: '$albums' },
          avg_rating: { 
            $avg: {
              $filter: {
                input: '$albums.average_rating',
                cond: { $gt: ['$$this', 0] }
              }
            }
          }
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
          avg_rating: -1,
          albums_count: -1
        }
      },
      { $limit: limit }
    ]).toArray();
  }

  static async deleteArtist(artistId) {
    const objectId = typeof artistId === 'string' ? new ObjectId(artistId) : artistId;
    
    const result = await this.getCollection().deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }
}

module.exports = Artist;