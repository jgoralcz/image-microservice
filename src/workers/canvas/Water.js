const { createCanvas, Image } = require('canvas');
const line = require('../WorkerHelpers/GetLinesHelper.js');

module.exports = {
  /**
   * gets the buffer from canvas
   * @param images the user's buffer
   * @param text the user's text
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
      text = text.toUpperCase();

      const x = text.length;
      let fontSize = 40;
      let my = 0;
      // eslint-disable-next-line no-empty
      if (x <= 15) {
      } else if (x <= 30) {
        fontSize = 32;
      } else if (x <= 70) {
        fontSize = 25;
      } else if (x <= 85) {
        fontSize = 22;
      } else if (x < 100) {
        fontSize = 18;
      } else if (x < 120) {
        fontSize = 15;
      } else if (x < 180) {
        my = 5;
        // 0.000278x^2\ -.177x\ +\ 36.37
        fontSize = 0.0032 * (x * x) - 0.878 * x + 76.545;
      } else if (x < 700) {
        my = 10;
        // y\ =\ 0.00000915x^2\ -\ 0.018x+14.45
        fontSize = 0.0000168 * (x * x) - 0.0365 * x + 21.62;
      } else {
        fontSize = 7;
      }
      ctx.font = `${fontSize}px 'Futura'`;
      ctx.translate(180, 75 - my);

      const lines = line.getLines(ctx, text, 205);
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 10, (i * fontSize) + 2);
      }

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
