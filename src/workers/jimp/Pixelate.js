const Jimp = require('jimp');

module.exports = {

  /**
   * generates the image.
   * @param imageURL the user's image
   * @param number the number
   * @returns {Promise<*>}
   */
  async execute(imageURL, number = 3) {
    try {
      const image = await Jimp.read(imageURL);

      let pixelateNumber = number;
      if (pixelateNumber <= 0) pixelateNumber = 3;

      // scale for faster processing
      if (image.bitmap.width > 600 || image.bitmap.height > 600) {
        image.scale(0.5);
      }

      return await image.pixelate(pixelateNumber).getBufferAsync(Jimp.MIME_JPEG);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
