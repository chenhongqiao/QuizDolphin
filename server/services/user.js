const mongodb = require('../databases/mongodb');
const userModel = require('../models/user');

class UserService {
  static async newUser(userInfo) {
    const usersCollection = await mongodb.loadCollection('users');
    const userWithSameEmail = await usersCollection.findOne({ email: userInfo.email });
    if (userWithSameEmail) {
      return { success: false, message: 'Email Already Exists!' };
    }
    const user = new userModel.User(userInfo);
    if (user.invalid) {
      return { success: false, message: 'Invalid User Syntax!' };
    }
    await usersCollection.insertOne(user);
    return { success: true };
  }

  static async deleteUser(email) {
    const usersCollection = await mongodb.loadCollection('users');
    const status = await usersCollection.deleteOne({ email });
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    return { success: true };
  }

  static async updateUser(email, userInfo) {
    const usersCollection = await mongodb.loadCollection('users');
    const user = new userModel.User(userInfo);
    if (user.invalid) {
      return { success: false, message: 'Invalid User Syntax!' };
    }
    const status = await usersCollection.updateOne({ email });
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    return { success: true };
  }
}
module.exports = UserService;
