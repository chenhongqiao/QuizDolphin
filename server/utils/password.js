const crypto = require('crypto');

class PasswordUtils {
  static saltedPassword(password, salt) {
    const hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
  }

  static newSalt() {
    return crypto.randomBytes(32).toString('hex');
  }
}
module.exports = PasswordUtils;
