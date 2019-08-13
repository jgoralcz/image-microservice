const { createCanvas, Image, loadImage } = require('canvas');

module.exports = {
  /**
   * gets the buffer from canvas
   * @param images the image buffers to hold
   * @param imageURL the user's image
   * @param imageSpecs the image's specs
   * @returns {Promise<*>}
   */
  execute: async (images, imageURL, imageSpecs) => {
    try {
      // get their image
      const theirImage = await loadImage(imageURL);

      const myImage = new Image();
      myImage.src = Buffer.from(images[0]);

      // get dimensions and specify it's 2d
      const canvas = createCanvas(myImage.width, myImage.height);
      const ctx = canvas.getContext('2d');
      // ctx.quality = 'fast';
      // ctx.patternQuality = 'fast';

      // ctx.translate(imageSpecs.compositeX1, imageSpecs.compositeY1);
      // // rotate if needed
      if (imageSpecs.rotate) {
        // rotate
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        ctx.translate(x, y);
        ctx.rotate(imageSpecs.rotate);

        ctx.translate(imageSpecs.compositeX1, imageSpecs.compositeY1);
        ctx.drawImage(theirImage, -x, -y, imageSpecs.resizeX || myImage.width,
          imageSpecs.resizeY || myImage.height);
        ctx.translate(-imageSpecs.compositeX1, -imageSpecs.compositeY1);

        ctx.rotate(-imageSpecs.rotate);
        ctx.translate(-x, -y);

        ctx.drawImage(myImage, 0, 0, myImage.width, myImage.height);
      } else {
        // draw their image based off of their specifications
        ctx.drawImage(theirImage, imageSpecs.compositeX1 || 0, imageSpecs.compositeY1 || 0,
          imageSpecs.resizeX || myImage.width, imageSpecs.resizeY || myImage.height);

        // draw my image
        ctx.drawImage(myImage, 0, 0, myImage.width, myImage.height);
      }

      return canvas.toBuffer('image/jpeg', undefined);
    } catch (error) {
      console.error('canvas helper error:', error);
    }
    return undefined;
  },
};
