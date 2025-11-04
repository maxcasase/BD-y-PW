const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class User {
  static getCollection() {
    return getDB().collection('users');
  }

  static async create(userData) {
    const userDocument = {
      username: userData.username,
      email: userData.email,
      password_hash: userData.password_hash,
      profile_name: userData.username,
      bio: null,
      avatar_url: null,
      created_at: new Date()
    };

    const result = await this.getCollection().insertOne(userDocument);
    return { _id: result.insertedId, ...userDocument };
  }

  static async findByEmail(email) {
    return await this.getCollection().findOne({ email: email });
  }

  static async findById(id) {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.getCollection().findOne(
      { _id: objectId },
      { 
        projection: { 
          password_hash: 0  // Excluir password del resultado
        }
      }
    );
  }

  static async updateProfile(userId, profileData) {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const updateDocument = {
      $set: {
        profile_name: profileData.profile_name,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        updated_at: new Date()
      }
    };

    const result = await this.getCollection().findOneAndUpdate(
      { _id: objectId },
      updateDocument,
      { returnDocument: 'after', projection: { password_hash: 0 } }
    );

    return result.value;
  }

  static async findByUsername(username) {
    return await this.getCollection().findOne({ username: username });
  }

  static async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.getCollection()
      .find({}, { projection: { password_hash: 0 } })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
}

module.exports = User;