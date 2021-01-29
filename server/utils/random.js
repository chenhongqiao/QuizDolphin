class RandomGenerator {
  static integer(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }
}
module.exports = RandomGenerator;
