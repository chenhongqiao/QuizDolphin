const mongodb = require('../databases/mongodb');
const userModel = require('../models/user');

class UserService {
  static async newUser(userInfo) {
    const usersCollection = await mongodb.loadCollection('users');
    const userWithSameEmail = await usersCollection.find({ email: userInfo.email });
    if (await userWithSameEmail.count()) {
      return { success: false, message: 'Email Already Exists!' };
    }
    const user = new userModel.User(userInfo);
    if (user.invalid) {
      return { success: false, message: 'Invalid User Syntax!' };
    }
    await usersCollection.insertOne(user);
    return { success: true, data: user.email };
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
    const status = await usersCollection.replaceOne({ email });
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    return { success: true, data: email };
  }

  static async getUserList() {
    const usersCollection = await mongodb.loadCollection('users');
    const userList = await usersCollection.find({})
      .project({ _id: 0, password: 0, salt: 0 }).toArray();
    return { success: true, data: userList };
  }
}
module.exports = UserService;
