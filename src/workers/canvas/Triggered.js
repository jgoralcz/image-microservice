const { createCanvas, Image, loadImage } = require('canvas');

const d = 280;


module.exports = {
  /**
   * gets the buffer from canvas
   * @param images the image buffers to hold
   * @param image the user's image
   * @returns {Promise<*>}
   */
  execute: async (images, image) => {
    try {
      // load triggered as node-canvas data.
      const triggeredImage = new Image();
      triggeredImage.src = Buffer.from(images[0]);

      // load red image as node-canvas data.
      const redImage = new Image();
      redImage.src = Buffer.from(images[1]);

      // get dimensions and specify it's 2d
      const canvas = createCanvas(d, d);
      const ctx = canvas.getContext('2d');

      // get their image.
      const theirImage = await loadImage(image);
      ctx.drawImage(theirImage, 0, 0, d, d);

      // draw red part
      ctx.drawImage(redImage, 0, 0, d, d);

      // draw triggered image
      ctx.drawImage(triggeredImage, 0, d - triggeredImage.height, triggeredImage.width, triggeredImage.height);
      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
