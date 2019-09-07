const { createCanvas, Image, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const MyBufferAccumulator = require('../WorkerHelpers/BufferAccumulator');
const imageD = 256;


module.exports = {
  /**
   * gets the buffer from canvas
   * @param images the image buffers to hold
   * @param image the user's image
   * @returns {Promise<*>}
   */
  execute: async (images, image) => {
    try {
      // get their image.
      const theirImage = await loadImage(image);

      // use gifencoder
      // create our new accumulator
      const myAccumulator = new MyBufferAccumulator();
      const encoder = new GIFEncoder(imageD, imageD, 'neuquant', true);
      encoder.createReadStream().pipe(myAccumulator);
      encoder.start();
      encoder.setQuality(1);
      encoder.setDelay(40);
      encoder.setDispose(2);

      // get our canvas and buffer
      const canvas = createCanvas(imageD, imageD);
      const ctx = canvas.getContext('2d');
      ctx.quality = 'fast';
      ctx.patternQuality = 'fast';

      // resize their image so we don't have to do it each time.
      const ctxResize = canvas.getContext('2d');
      ctxResize.drawImage(theirImage, 0, 0, imageD, imageD);
      const buffer = canvas.toBuffer('image/jpeg', undefined);
      theirImage.src = Buffer.from(buffer);

      // loop over all images.
      const length = (images.length > 65) ? 65 : images.length;
      for (let i = 0; i < length - 1; i += 1) {
        ctx.globalAlpha = 1;
        const background = new Image();
        background.src = Buffer.from(images[i]);
        ctx.drawImage(background, 0, 0, imageD, imageD);

        // get buffer and resize our image to our length
        ctx.globalAlpha = 0.5;
        ctx.drawImage(theirImage, 0, 0, imageD, imageD);
        encoder.addFrame(ctx);
      }
      encoder.finish();

      return await myAccumulator.getBuffer();
    } catch (error) {
      console.error(error);
    }
    return undefined;
  },
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.
