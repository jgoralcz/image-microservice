const sharp = require('sharp');

module.exports = {

  /**
   * blurs an image
   * blur sigma (0.3 - 1000.0)
   * @param buffer the buffer image to load in.
   * @param number the number to sharpen by.
   * @returns {buffer}
   */
  execute(buffer, number) {
    let testNumber = number;
    if (testNumber < 0.3) testNumber = 0.3;
    if (testNumber > 1000) testNumber = 1000;
    return sharp(buffer).blur(number).toBuffer();
  },
};
