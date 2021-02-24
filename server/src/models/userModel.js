const passwordUtils = require('../utils/passwordUtil');
const validateUtils = require('../utils/validateUtil');

function User(userInfo) {
  if (validateUtils.validateUserInfo(userInfo)) {
    this.email = userInfo.email; // Email of this user
    this.name = userInfo.name; // Name of this user
    this.role = userInfo.role; // Role of this user
    this.salt = passwordUtils.newSalt(); // The random salt
    this.password = passwordUtils.saltedPassword(userInfo.password, this.salt); // Hashed password
  } else {
    this.invalid = true;
  }
}

module.exports = { User };
