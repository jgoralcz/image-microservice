const Jimp = require('jimp');

module.exports = {

  /**
   * jpegify their image
   * @param imageURL the image url
   * @returns {Promise<*>}
   */
  async execute(imageURL) {
    const random = Math.ceil(Math.random() * 4) + 4;
    const randomblur = Math.ceil(Math.random() * 2);

    try {
      // read image
      const image = await Jimp.read(imageURL);

      // going to be crap anyways, let's just reduce size to reduce computation load
      if (image.bitmap.width > 600 || image.bitmap.height > 600) {
        image.scale(0.5);
      }

      image.blur(randomblur);
      image.pixelate(3);
      image.quality(random);

      return await image.getBufferAsync(Jimp.MIME_JPEG);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
