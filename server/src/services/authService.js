const bcrypt = require('bcrypt');
const mongodb = require('../databases/mongodb');

class AuthService {
  static async login(email, password) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInfoCursor = await usersCollection.find({ email }).project({ _id: 0 });
    // Fail if email does not exist
    if (await userInfoCursor.count() === 0) {
      return { success: false };
    }
    const userInfo = (await userInfoCursor.toArray())[0];
    // Check password
    if (await bcrypt.compare(password, userInfo.password)) {
      // Salted password and salt should be kept in database
      delete userInfo.password;
      delete userInfo.salt;
      return { success: true, data: userInfo };
    }
    return { success: false };
  }

  static async getInfo(email) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInfoCursor = await usersCollection
    // Salted password and salt should be kept in database
      .find({ email }).project({ password: 0, salt: 0, _id: 0 });
    if (await userInfoCursor.count() === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    const userInfo = (await userInfoCursor.toArray())[0];
    return { success: true, data: userInfo };
  }
}

module.exports = AuthService;
