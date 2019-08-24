const { createCanvas, Image, registerFont } = require('canvas');
const line = require('../WorkerHelpers/GetLinesHelper.js');

registerFont('./assets/fonts/LaterAllie-Gator.ttf', { family: 'LatterAllie-Gator' });
const tx = 120;
const ty = 440;

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
      ctx.rotate(0.03);

      const x = text.length;
      // let fontSize = 11;
      let fontSize = 72;
      // ctx.translate(310, 340);
      // eslint-disable-next-line no-empty
      if (x <= 15) {
      } else if (x <= 30) {
        fontSize = 42;
      } else if (x <= 70) {
        fontSize = 36;
      } else if (x <= 85) {
        fontSize = 30;
      } else if (x < 100) {
        fontSize = 26;
      } else if (x < 120) {
        fontSize = 20;
      } else if (x < 180) {
        // 0.000278x^2\ -.177x\ +\ 36.37
        fontSize = 0.0032 * (x * x) - 0.878 * x + 80.545; // before 76.545
      } else if (x < 700) {
        // y\ =\ 0.00000915x^2\ -\ 0.018x+14.45
        fontSize = 0.0000168 * (x * x) - 0.0319 * x + 23.62;
      } else {
        fontSize = 7;
      }
      ctx.translate(tx, ty);
      ctx.font = `${fontSize}px 'LaterAllie-Gator'`;

      const lines = line.getLines(ctx, text, 280);
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], 10, (i * fontSize) - 5);
      }

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
