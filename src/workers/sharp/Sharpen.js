const sharp = require('sharp');

module.exports = {

  /**
   * sharpens an image
   * sharpen sigma (0.01 - 10000)
   * @param buffer the buffer image to load in.
   * @param number the number to sharpen by.
   * @returns {buffer}
   */
  execute(buffer, number) {
    let testNumber = number;
    if (testNumber < 0.01) testNumber = 0.01;
    if (testNumber > 10000) testNumber = 10000;
    return sharp(buffer).sharpen(testNumber).toBuffer();
  },
};
