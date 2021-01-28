const mongodb = require('../databases/mongodb');
const passwordUtils = require('../utils/password');

class AuthService {
  static async login(email, password) {
    let success = false;
    const usersCollection = await mongodb.loadCollection('users');
    const userInformation = await usersCollection.findOne({ email });
    if (!userInformation) {
      success = false;
    } else {
      const saltedPassword = passwordUtils.saltedPassword(password, userInformation.salt);
      if (saltedPassword === userInformation.password) {
        success = true;
        delete userInformation.password;
        delete userInformation.salt;
      } else {
        success = false;
      }
    }
    return { success, data: userInformation };
  }

  static async getInfo(email) {
    const usersCollection = await mongodb.loadCollection('users');
    const userInformationCursor = await usersCollection.find({ email });
    if (await userInformationCursor.count() === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    const userInformation = userInformationCursor.toArray()[0];
    delete userInformation.password;
    delete userInformation.salt;
    return { success: true, data: userInformation };
  }
}

module.exports = AuthService;
