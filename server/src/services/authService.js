const mongodb = require('../databases/mongodb');
const passwordUtils = require('../utils/passwordUtil');

class AuthService {
  static async login(email, password) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInformationCursor = await usersCollection.find({ email }).project({ _id: 0 });
    // Fail if email does not exist
    if (await userInformationCursor.count() === 0) {
      return { success: false };
    }
    const userInformation = (await userInformationCursor.toArray())[0];
    // Create salted password from user's submission and salt
    const saltedPassword = passwordUtils.saltedPassword(password, userInformation.salt);
    // Check password
    if (saltedPassword === userInformation.password) {
      // Salted password and salt should be kept in database
      delete userInformation.password;
      delete userInformation.salt;
      return { success: true, data: userInformation };
    }
    return { success: false };
  }

  static async getInfo(email) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInformationCursor = await usersCollection
    // Salted password and salt should be kept in database
      .find({ email }).project({ password: 0, salt: 0, _id: 0 });
    if (await userInformationCursor.count() === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    const userInformation = (await userInformationCursor.toArray())[0];
    return { success: true, data: userInformation };
  }
}

module.exports = AuthService;
