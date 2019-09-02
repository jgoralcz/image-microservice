const { createCanvas, Image, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const gifFrames = require('gif-frames');
const MyBufferAccumulator = require('../WorkerHelpers/BufferAccumulator');

const frames = new Array(50);
// get our frames and store them.
(async () => {
  for (let i = 0; i < 50; i += 1) {
    const accumulator = new MyBufferAccumulator();
    const frame = await gifFrames({ url: './assets/images/america2.gif', frames: i });
    frame[0].getImage().pipe(accumulator);
    frames[i] = await accumulator.getBuffer();
  }
  console.log('okay done');
})();
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
      encoder.setQuality(5);
      encoder.setDelay(22);

      // get our canvas and buffer
      const canvas = createCanvas(imageD, imageD);
      const ctx = canvas.getContext('2d');

      for (let i = 0; i < 50; i += 1) {
        ctx.globalAlpha = 1;
        const background = new Image();
        background.src = Buffer.from(frames[i]);
        ctx.drawImage(background, 0, 0);

        // get buffer and resize our image to our length
        ctx.globalAlpha = 0.3;
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
