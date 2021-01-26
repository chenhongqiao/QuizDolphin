const crypto = require('crypto');

function saltedPassword(password, salt) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

function newSalt() {
  return crypto.randomBytes(32).toString('hex');
}
module.exports = { saltedPassword, newSalt };
