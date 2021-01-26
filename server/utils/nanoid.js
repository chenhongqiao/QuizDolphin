const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const number = '0123456789';
const numId = customAlphabet(number, 16);
const charId = customAlphabet(alphabet, 20);

module.exports = { numId, charId };
