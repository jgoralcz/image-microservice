const { createCanvas, Image, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const MyBufferAccumulator = require('../WorkerHelpers/BufferAccumulator');

const d = 256;
const imageD = 324;

/**
 * returns a random number between min (inclusive) and max (exclusive)
 * @param min the min num.
 * @param max the max num.
 */
const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;

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
      const encoder = new GIFEncoder(d, d, 'neuquant', true);
      encoder.createReadStream().pipe(myAccumulator);
      encoder.start();
      encoder.setQuality(5);
      encoder.setRepeat(0);
      encoder.setDelay(22);
      encoder.setDispose(2);

      // load triggered as node-canvas data.
      const triggeredImage = new Image();
      triggeredImage.src = Buffer.from(images[0]);

      // load red image as node-canvas data.
      const redImage = new Image();
      redImage.src = Buffer.from(images[1]);


      // get our canvas and buffer
      const canvasResize = createCanvas(imageD, imageD);
      const ctxResize = canvasResize.getContext('2d');

      // get buffer and resize our image to 324 x 324
      ctxResize.drawImage(theirImage, 0, 0, 324, 324);
      const buffer = canvasResize.toBuffer('image/jpeg', undefined);
      theirImage.src = Buffer.from(buffer);


      // get dimensions and specify it's 2d
      const canvas = createCanvas(d, d);
      const ctx = canvas.getContext('2d');

      for (let i = 0; i < 8; i += 1) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (i === 0) {
          // draw their image
          ctx.drawImage(theirImage, -18, -18);

          // draw red part
          ctx.drawImage(redImage, 0, 0, d, d);

          // draw triggered image
          ctx.drawImage(triggeredImage, -10, d - triggeredImage.height + 4);
          encoder.addFrame(ctx);
        } else {
          // draw their image
          ctx.drawImage(theirImage, -32 + getRandomArbitrary(-16, 16), -32 + getRandomArbitrary(-16, 16));

          // draw red part
          ctx.drawImage(redImage, 0, 0, d, d);

          // draw triggered image
          ctx.drawImage(triggeredImage, -10 + getRandomArbitrary(-12, 12), (d - triggeredImage.height + 4) + getRandomArbitrary(0, 12));
          encoder.addFrame(ctx);
        }
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
