const { createCanvas, Image } = require('canvas');
const line = require('../WorkerHelpers/GetLinesHelper.js');


module.exports = {
  /**
   * gets the buffer from canvas
   * @param images the buffer images.
   * @param text1 the user's text for the first graph.
   * @param text2 the user's text for the second graph.
   * @returns {Promise<*>}
   */
  execute: async (images, text1, text2) => {
    try {
      // load image as node-canvas data
      const img = new Image();
      img.src = Buffer.from(images[0]);

      // get dimensions and specify it's 2d
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      // draw image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // font and size
      const fontSize = 18;
      ctx.font = `${fontSize}px 'Product Sans'`;

      ctx.translate(48, 60);
      const lines = line.getLines(ctx, text1, 440);
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], 10, (i * (fontSize + 10)) + 5);
      }

      ctx.translate(382, 0);
      const lines2 = line.getLines(ctx, text2, 440);
      for (let i = 0; i < lines2.length; i += 1) {
        ctx.fillText(lines2[i], 10, (i * (fontSize + 10)) + 5);
      }

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
