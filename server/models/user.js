const passwordUtils = require('../utils/password');

function User(userInfo) {
  this.email = userInfo.email;
  this.name = userInfo.name;
  this.type = userInfo.type;
  this.salt = passwordUtils.newSalt();
  this.password = passwordUtils.saltedPassword(this.password, this.salt);
}

module.exports = { User };
