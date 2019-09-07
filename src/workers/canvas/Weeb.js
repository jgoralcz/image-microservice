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
      const encoder = new GIFEncoder(imageD, imageD, 'neuquant', false);
      encoder.createReadStream().pipe(myAccumulator);
      encoder.start();
      // encoder.setQuality(30);
      // encoder.setDelay(90);

      // get our canvas and buffer
      const canvas = createCanvas(imageD, imageD);
      const ctx = canvas.getContext('2d');

      // resize their image so we don't have to do it each time.
      const ctxResize = canvas.getContext('2d');
      ctxResize.drawImage(theirImage, 0, 0, imageD, imageD);
      const buffer = canvas.toBuffer('image/jpeg', undefined);
      theirImage.src = Buffer.from(buffer);

      // loop over all images.
      for (let i = 0; i < images.length; i += 1) {
        ctx.globalAlpha = 1;
        const background = new Image();
        background.src = Buffer.from(images[i]);
        ctx.drawImage(background, 0, 0);

        // get buffer and resize our image to our length
        ctx.globalAlpha = 0.4;
        ctx.drawImage(theirImage, 0, 0);
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
