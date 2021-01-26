const mongodb = require('../databases/mongodb');
const passwordUtils = require('../utils/password');

async function login(email, password, session) {
  let success = false;
  const usersCollection = await mongodb.loadCollection('users');
  const userInformation = await usersCollection.findOne({ email });
  if (!userInformation) {
    success = false;
  } else {
    const saltedPassword = passwordUtils.saltedPassword(password, userInformation.salt);
    if (saltedPassword === userInformation.password) {
      success = true;
      // eslint-disable-next-line no-param-reassign
      session.loggedin = true;
      // eslint-disable-next-line no-param-reassign
      session.email = email;
      // eslint-disable-next-line no-param-reassign
      session.type = userInformation.type;
    } else {
      success = false;
    }
  }
  return success;
}

async function info(email) {
  const usersCollection = await mongodb.loadCollection('users');
  const userInformation = await usersCollection.findOne({ email });
  delete userInformation.password;
  delete userInformation.salt;
  return userInformation;
}

module.exports = { login, info };
