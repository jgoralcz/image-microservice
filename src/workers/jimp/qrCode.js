const qr = require('qr-image');

module.exports = {

  /**
   * generates the image.
   * @param imageURL the user's image
   * @returns {Promise<*>}
   */
  async execute(imageURL) {
    try {
      return await qr.imageSync(imageURL, { type: 'png' });
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
