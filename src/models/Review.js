const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Review {
  static getCollection() {
    return getDB().collection('reviews');
  }

  static async create(reviewData) {
    const reviewDocument = {
      user_id: typeof reviewData.user_id === 'string' ? new ObjectId(reviewData.user_id) : reviewData.user_id,
      album_id: typeof reviewData.album_id === 'string' ? new ObjectId(reviewData.album_id) : reviewData.album_id,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      likes_count: 0,
      dislikes_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Verificar si ya existe una review del usuario para este álbum
    const existingReview = await this.getCollection().findOne({
      user_id: reviewDocument.user_id,
      album_id: reviewDocument.album_id
    });

    if (existingReview) {
      throw new Error('User already reviewed this album');
    }

    const result = await this.getCollection().insertOne(reviewDocument);
    
    // Actualizar rating del álbum
    await this.updateAlbumRating(reviewDocument.album_id);
    
    return { _id: result.insertedId, ...reviewDocument };
  }

  static async findById(id) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await this.getCollection().aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'albums',
          localField: 'album_id',
          foreignField: '_id',
          as: 'album'
        }
      },
      {
        $addFields: {
          username: { $arrayElemAt: ['$user.username', 0] },
          profile_name: { $arrayElemAt: ['$user.profile_name', 0] },
          avatar_url: { $arrayElemAt: ['$user.avatar_url', 0] },
          album_title: { $arrayElemAt: ['$album.title', 0] }
        }
      },
      {
        $project: {
          user: 0,
          album: 0
        }
      }
    ]).toArray();

    return result[0] || null;
  }

  static async findByUserAndAlbum(userId, albumId) {
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const albumObjectId = typeof albumId === 'string' ? new ObjectId(albumId) : albumId;
    
    return await this.getCollection().findOne({
      user_id: userObjectId,
      album_id: albumObjectId
    });
  }

  static async findByAlbumId(albumId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const objectId = typeof albumId === 'string' ? new ObjectId(albumId) : albumId;
    
    return await this.getCollection().aggregate([
      { $match: { album_id: objectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $addFields: {
          username: { $arrayElemAt: ['$user.username', 0] },
          profile_name: { $arrayElemAt: ['$user.profile_name', 0] },
          avatar_url: { $arrayElemAt: ['$user.avatar_url', 0] }
        }
      },
      {
        $project: {
          user: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async findByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    return await this.getCollection().aggregate([
      { $match: { user_id: objectId } },
      {
        $lookup: {
          from: 'albums',
          localField: 'album_id',
          foreignField: '_id',
          as: 'album'
        }
      },
      {
        $lookup: {
          from: 'artists',
          localField: 'album.artist_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $addFields: {
          album_title: { $arrayElemAt: ['$album.title', 0] },
          cover_image: { $arrayElemAt: ['$album.cover_image', 0] },
          artist_name: { $arrayElemAt: ['$artist.name', 0] }
        }
      },
      {
        $project: {
          album: 0,
          artist: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.getCollection().aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'albums',
          localField: 'album_id',
          foreignField: '_id',
          as: 'album'
        }
      },
      {
        $addFields: {
          username: { $arrayElemAt: ['$user.username', 0] },
          profile_name: { $arrayElemAt: ['$user.profile_name', 0] },
          avatar_url: { $arrayElemAt: ['$user.avatar_url', 0] },
          album_title: { $arrayElemAt: ['$album.title', 0] }
        }
      },
      {
        $project: {
          user: 0,
          album: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();
  }

  static async update(reviewId, reviewData) {
    const objectId = typeof reviewId === 'string' ? new ObjectId(reviewId) : reviewId;
    
    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (result.value) {
      await this.updateAlbumRating(result.value.album_id);
      return true;
    }
    return false;
  }

  static async delete(reviewId) {
    const objectId = typeof reviewId === 'string' ? new ObjectId(reviewId) : reviewId;
    
    const review = await this.getCollection().findOne({ _id: objectId });
    
    if (!review) {
      return false;
    }

    const result = await this.getCollection().deleteOne({ _id: objectId });
    
    if (result.deletedCount > 0) {
      await this.updateAlbumRating(review.album_id);
      return true;
    }
    
    return false;
  }

  static async getRecentReviews(limit = 10) {
    return await this.getCollection().aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'albums',
          localField: 'album_id',
          foreignField: '_id',
          as: 'album'
        }
      },
      {
        $lookup: {
          from: 'artists',
          localField: 'album.artist_id',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $addFields: {
          username: { $arrayElemAt: ['$user.username', 0] },
          profile_name: { $arrayElemAt: ['$user.profile_name', 0] },
          avatar_url: { $arrayElemAt: ['$user.avatar_url', 0] },
          album_title: { $arrayElemAt: ['$album.title', 0] },
          cover_image: { $arrayElemAt: ['$album.cover_image', 0] },
          artist_name: { $arrayElemAt: ['$artist.name', 0] }
        }
      },
      {
        $project: {
          user: 0,
          album: 0,
          artist: 0
        }
      },
      { $sort: { created_at: -1 } },
      { $limit: limit }
    ]).toArray();
  }

  static async getTopReviewers(limit = 10) {
    return await this.getCollection().aggregate([
      {
        $group: {
          _id: '$user_id',
          reviews_count: { $sum: 1 },
          avg_rating: { $avg: '$rating' }
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
        $addFields: {
          id: '$_id',
          username: { $arrayElemAt: ['$user.username', 0] },
          profile_name: { $arrayElemAt: ['$user.profile_name', 0] },
          avatar_url: { $arrayElemAt: ['$user.avatar_url', 0] }
        }
      },
      {
        $match: {
          reviews_count: { $gt: 0 }
        }
      },
      {
        $project: {
          user: 0,
          _id: 0
        }
      },
      {
        $sort: {
          reviews_count: -1,
          avg_rating: -1
        }
      },
      { $limit: limit }
    ]).toArray();
  }

  static async updateAlbumRating(albumId) {
    const objectId = typeof albumId === 'string' ? new ObjectId(albumId) : albumId;
    
    const stats = await this.getCollection().aggregate([
      { $match: { album_id: objectId } },
      {
        $group: {
          _id: null,
          average_rating: { $avg: '$rating' },
          total_ratings: { $sum: 1 }
        }
      }
    ]).toArray();

    const avgRating = stats.length > 0 ? stats[0].average_rating : 0;
    const totalRatings = stats.length > 0 ? stats[0].total_ratings : 0;

    await getDB().collection('albums').findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          average_rating: avgRating,
          total_ratings: totalRatings,
          updated_at: new Date()
        }
      }
    );
  }

  static async likeReview(reviewId) {
    const objectId = typeof reviewId === 'string' ? new ObjectId(reviewId) : reviewId;
    
    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      { $inc: { likes_count: 1 } },
      { returnDocument: 'after' }
    );
    
    return result.value !== null;
  }

  static async dislikeReview(reviewId) {
    const objectId = typeof reviewId === 'string' ? new ObjectId(reviewId) : reviewId;
    
    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      { $inc: { dislikes_count: 1 } },
      { returnDocument: 'after' }
    );
    
    return result.value !== null;
  }
}

module.exports = Review;