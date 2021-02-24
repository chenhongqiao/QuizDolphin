const bcrypt = require('bcrypt');
const mongodb = require('../databases/mongodb');
const userModel = require('../models/userModel');

class UserService {
  static async newUser(userInfo) {
    const usersCollection = await mongodb.loadCollection('users');
    // Make sure there's no user with same email
    const userWithSameEmail = await usersCollection.find({ email: userInfo.email });
    if (await userWithSameEmail.count()) {
      return { success: false, message: 'Email Already Exists!' };
    }
    const salt = await bcrypt.genSalt(12);
    const saltedPassword = await bcrypt.hash(userInfo.password, salt);
    // Construct user record
    const user = new userModel.User(userInfo, saltedPassword);
    if (user.invalid) {
      return { success: false, message: 'Invalid User Syntax!' };
    }
    await usersCollection.insertOne(user);
    return { success: true, data: user.email };
  }

  static async deleteUser(email) {
    const usersCollection = await mongodb.loadCollection('users');
    const status = await usersCollection.deleteOne({ email });
    // Delete user, 404 if not found
    if (status.deletedCount === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    return { success: true };
  }

  static async updateUser(email, userInfo) {
    const usersCollection = await mongodb.loadCollection('users');
    const newInfo = userInfo;
    // Email should not be updated, since email is used as this identifier
    newInfo.email = email;
    const salt = await bcrypt.genSalt(12);
    const saltedPassword = await bcrypt.hash(userInfo.password, salt);
    const user = new userModel.User(newInfo, saltedPassword);
    if (user.invalid) {
      return { success: false, message: 'Invalid User Syntax!' };
    }
    // Update record, atomic action
    const status = await usersCollection.updateOne({ email }, { $set: user });
    if (status.matchedCount === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    return { success: true, data: email };
  }

  static async getUserList() {
    const usersCollection = await mongodb.loadCollection('users');
    // Get user list sorted by added time
    const userList = await usersCollection.find({})
      .project({ _id: 0, password: 0, salt: 0 }).sort({ id: 1 }).toArray();
    return { success: true, data: userList };
  }

  static async getUserInfo(email) {
    const usersCollection = await mongodb.loadCollection('users');
    // Salt and password should be kept in database
    const userCursor = await usersCollection.find({ email })
      .project({ _id: 0, password: 0, salt: 0 });
    if (await userCursor.count() === 0) {
      return { success: false, message: 'No Matching User!' };
    }
    return { success: true, data: (await userCursor.toArray())[0] };
  }
}
module.exports = UserService;
