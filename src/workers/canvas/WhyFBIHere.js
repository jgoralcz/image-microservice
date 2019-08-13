const { createCanvas, Image } = require('canvas');

module.exports = {
  /**
   * gets the buffer from canvas
   * @param images the images buffer
   * @param text the image text
   * @returns {Promise<*>}
   */
  execute: async (images, text) => {
    try {
      // load image as node-canvas data
      const img = new Image();
      img.src = Buffer.from(images[0]);

      // get dimensions and specify it's 2d
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      // draw image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const fontSize = 32;
      ctx.font = `${fontSize}px 'Arial'`;
      await ctx.fillText(text, 40, 290);

      // load image as node-canvas data
      const img2 = new Image();
      img2.src = Buffer.from(images[1]);
      ctx.drawImage(img2, 627, 0, img2.width, img2.height);

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
