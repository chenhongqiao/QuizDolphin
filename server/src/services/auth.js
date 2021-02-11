const mongodb = require('../databases/mongodb');
const passwordUtils = require('../utils/password');

class AuthService {
  static async login(email, password) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInformationCursor = await usersCollection.find({ email }).project({ _id: 0 });
    if (await userInformationCursor.count() === 0) {
      return { success: false };
    }
    const userInformation = (await userInformationCursor.toArray())[0];
    const saltedPassword = passwordUtils.saltedPassword(password, userInformation.salt);
    if (saltedPassword === userInformation.password) {
      delete userInformation.password;
      delete userInformation.salt;
      return { success: true, data: userInformation };
    }
    return { success: false };
  }

  static async getInfo(email) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInformationCursor = await usersCollection
      .find({ email }).project({ password: 0, salt: 0, _id: 0 });
    if (await userInformationCursor.count() === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    const userInformation = (await userInformationCursor.toArray())[0];
    return { success: true, data: userInformation };
  }
}

module.exports = AuthService;
