const validateUtils = require('../utils/validateUtil');

function User(userInfo, password) {
  if (validateUtils.validateUserInfo(userInfo, password)) {
    this.email = userInfo.email; // Email of this user
    this.name = userInfo.name; // Name of this user
    this.role = userInfo.role; // Role of this user
    this.password = password; // Hashed password
  } else {
    this.invalid = true;
  }
}

module.exports = { User };
