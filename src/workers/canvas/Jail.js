const { createCanvas, Image, loadImage } = require('canvas');

module.exports = {
  desiredVal: 480,

  /**
   * generates the image.
   * @param images my local image (bazinga)
   * @param imageURL the user's image
   * @returns {Promise<*>}
   */
  async execute(images, imageURL) {
    try {
      // get their image
      const theirImage = await loadImage(imageURL);

      const myImage = new Image();
      myImage.src = Buffer.from(images[0]);

      const { width, height } = theirImage;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(theirImage, 0, 0, width, height);
      ctx.drawImage(myImage, 0, 0, width, height);

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
