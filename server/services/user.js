const mongodb = require('../databases/mongodb');
const userModel = require('../models/user');

async function newUser(userInfo) {
  const usersCollection = await mongodb.loadCollection('users');
  const userWithSameEmail = await usersCollection.findOne({ email: userInfo.email });
  if (await userWithSameEmail) {
    return 'Email Already Exists!';
  }
  await usersCollection.insertOne(
    new userModel.User(userInfo),
  );
  return 'Success!';
}

async function deleteUser(email) {
  const usersCollection = await mongodb.loadCollection('users');
  return usersCollection.deleteOne({ email });
}

async function updateUser(email, userInfo) {
  const usersCollection = await mongodb.loadCollection('users');
  return usersCollection.updateOne({ email }, new userModel.User(userInfo));
}
module.exports = { newUser, deleteUser, updateUser };
