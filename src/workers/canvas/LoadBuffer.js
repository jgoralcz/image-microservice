const { createCanvas, loadImage } = require('canvas');

module.exports = {

  /**
   * generates the image.
   * @param imageURL the user's image to load as a buffer
   * @returns {Promise<*>}
   */
  async execute(imageURL) {
    try {
      // get their image
      const theirImage = await loadImage(imageURL);

      const canvas = createCanvas(theirImage.width, theirImage.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(theirImage, 0, 0, theirImage.width, theirImage.height);

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
