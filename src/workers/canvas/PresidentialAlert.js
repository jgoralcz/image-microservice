const { createCanvas, Image } = require('canvas');
const line = require('../WorkerHelpers/GetLinesHelper.js');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


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

      // get date and time
      // const date = new Date();
      // const time = `${date.getHours() + 1}:${date.getMinutes()}`;
      // const month = `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDay()}`;
      //
      // const fontTime = 264;
      // ctx.translate(600, 450);
      //
      // // color time and date white
      // canvas.fillStyle = '#ffffff';
      // ctx.font = `${fontTime}px 'Helvetica Neue'`;
      // ctx.textAlign = 'center';
      // const timeLines = line.getLines(ctx, time, 1125);
      // for (let i = 0; i < timeLines.length; i += 1) {
      //   ctx.fillText(timeLines[i], 10, (i * fontTime));
      // }
      //


      // color it back to black and write their message.
      const fontSize = 36;
      ctx.font = `${fontSize}px 'Helvetica Neue'`;
      ctx.translate(-550, 420);
      canvas.fillStyle = '#000000';
      ctx.textAlign = 'left';
      const lines = line.getLines(ctx, text, 1125);
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], 10, (i * fontSize) + 5);
      }

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
