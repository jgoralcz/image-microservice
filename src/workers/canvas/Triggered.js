const { createCanvas, Image, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');

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
      // use gifencoder
      const encoder = new GIFEncoder(d, d);
      const stream = encoder.createReadStream();
      encoder.start();
      encoder.setRepeat(0); // 0 for repeat
      encoder.setDelay(1); // frame delay in ms

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
      encoder.addFrame(ctx);

      // translate frame 2
      ctx.translate(3, 4);
      encoder.addFrame(ctx);
      ctx.translate(-3, -4);
      encoder.addFrame(ctx);
      // return canvas.toBuffer('image/jpeg', undefined);
      encoder.finish();
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
