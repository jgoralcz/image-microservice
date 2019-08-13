const { createCanvas, Image } = require('canvas');
const line = require('../WorkerHelpers/GetLinesHelper.js');
const { formatTwitterTime } = require('../WorkerHelpers/FormatTwitterTime.js');


module.exports = {
  /**
   * gets the buffer from canvas
   * @param images our image
   * @param text the user's text
   * @returns {Promise<*>}
   */
  execute: async (images, text) => {
    try {
      const img = new Image();
      img.src = Buffer.from(images[0]);

      let canvas;
      let height;
      if (text.length < 52) {
        height = img.height;
        canvas = createCanvas(img.width, height);
      } else if (text.length < 104) {
        height = img.height + 50;
        canvas = createCanvas(img.width, height);
      } else if (text.length < 156) {
        height = img.height + 100;
        canvas = createCanvas(img.width, height);
      } else if (text.length < 212) {
        height = img.height + 150;
        canvas = createCanvas(img.width, height);
      } else if (text.length < 264) {
        height = img.height + 200;
        canvas = createCanvas(img.width, height);
      } else {
        height = img.height + 250;
        canvas = createCanvas(img.width, height);
      }


      // get dimensions and specify it's 2d
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, img.width, height);

      // draw image
      ctx.drawImage(img, 0, 0, img.width, img.height);


      // writing the font
      const fontSize = 48;
      ctx.font = `${fontSize}px 'Helvetica'`;

      ctx.fillStyle = '#000';
      const lines = line.getLines(ctx, text, 1140);
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], 75, (i * (fontSize + 10)) + 220);
      }

      // add date and time
      // draw image
      const fontSize2 = 24;
      ctx.font = `${fontSize2}px 'Helvetica'`;
      ctx.fillStyle = '#657786';
      ctx.fillText(await formatTwitterTime(), 75, height - 30);

      return await canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
