const { createCanvas, Image, registerFont } = require('canvas');
const line = require('../WorkerHelpers/GetLinesHelper.js');

registerFont('./assets/fonts/Certificate.ttf', { family: 'Certificate' });
registerFont('./assets/fonts/Adine_Kirnberg.ttf', { family: 'Adine' });

module.exports = {
  /**
   * gets the buffer from canvas
   * @param images buffer image
   * @param name the user's name to add to the certificate.
   * @param reason the reason to add to the certificate.
   * @param date the date to add to the certificate.
   * @param signature the signature to add to the certificate.
   * @returns {Promise<*>}
   */
  execute: async (images, name, reason, date, signature) => {
    try {
      // load image as node-canvas data
      const img = new Image();
      img.src = Buffer.from(images[0]);

      // get dimensions and specify it's 2d
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      // draw image
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // align our text.
      ctx.textAlign = 'center';

      // font name
      ctx.translate(500, 335);
      const fontNameSize = 64;
      ctx.font = `${fontNameSize}px 'Certificate'`;
      const lines = line.getLines(ctx, name, 500);
      for (let i = 0; i < lines.length; i += 1) {
        ctx.fillText(lines[i], 0, (i * fontNameSize));
      }

      // align our reason for their certificate.
      ctx.translate(0, 110);
      const fontReasonSize = 42;
      ctx.font = `${fontReasonSize}px 'Certificate'`;
      const linesReason = line.getLines(ctx, reason, 500);
      for (let i = 0; i < linesReason.length; i += 1) {
        ctx.fillText(linesReason[i], 0, (i * fontReasonSize));
      }

      // use their date
      const otherSize = 42;
      ctx.translate(-210, 119);
      ctx.font = `${otherSize}px 'Adine'`;
      const linesDate = line.getLines(ctx, date, 500);
      for (let i = 0; i < linesDate.length; i += 1) {
        ctx.fillText(linesDate[i], 0, (i * otherSize));
      }

      // use their name
      ctx.translate(430, 0);
      ctx.font = `${otherSize}px 'Adine'`;
      const linesName = line.getLines(ctx, signature, 500);
      for (let i = 0; i < linesName.length; i += 1) {
        ctx.fillText(linesName[i], 0, (i * otherSize));
      }


      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
