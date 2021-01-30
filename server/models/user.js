const passwordUtils = require('../utils/password');
const validateUtils = require('../utils/validate');

function User(userInfo) {
  if (validateUtils.validateUserInfo(userInfo)) {
    this.email = userInfo.email;
    this.name = userInfo.name;
    this.role = userInfo.role;
    this.salt = passwordUtils.newSalt();
    this.password = passwordUtils.saltedPassword(userInfo.password, this.salt);
  } else {
    this.invalid = true;
  }
}

module.exports = { User };
