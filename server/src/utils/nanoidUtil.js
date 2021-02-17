const { customAlphabet } = require('nanoid');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const charId = customAlphabet(alphabet, 20);

module.exports = { charId };
