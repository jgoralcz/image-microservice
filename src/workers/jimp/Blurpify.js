const Jimp = require('jimp');

module.exports = {

  /**
   * generates the image.
   * @param imageURL the user's image
   * @returns {Promise<*>}
   */

  async execute(imageURL) {
    try {
      const image = await Jimp.read(imageURL);

      image.grayscale();
      image.brightness(-0.15);

      image.color([
        { apply: 'red', params: [114] },
        { apply: 'green', params: [137] },
        { apply: 'blue', params: [218] },
        // {apply: 'saturate', params: [20]},
        // {apply: 'mix', params: [90]}
      ]);
      // image.contrast(0.475);
      image.normalize();
      image.quality(80);

      return await image.getBufferAsync(Jimp.MIME_JPEG);


      //
      //     const theirImage = await loadImage(image_url);
      //
      //     let canvas = createCanvas(theirImage.width, theirImage.height);
      //     let ctx = canvas.getContext('2d');
      //
      //     ctx.drawImage(theirImage, 0, 0, theirImage.width, theirImage.height);
      //
      //     let imageData = ctx.getImageData(0, 0, theirImage.width, theirImage.height);
      //     imageData = await this.grayscale(imageData);
      //     // imageData = await this.modifyColors(imageData);
      //     ctx.putImageData(imageData, 0, 0);
      //
      //     ctx.globalAlpha = 0.04;
      //     ctx.fillStyle = '#7289da';
      //     ctx.fillRect(0, 0, theirImage.width, theirImage.height);
      //     ctx.globalAlpha = 1.0; // reset
      //
      //     // // saturation
      //     ctx.globalCompositeOperation = 'saturation';
      //     ctx.fillStyle = `hsl(0, 100%, 80%)`;
      //     ctx.fillRect(0, 0, theirImage.width, theirImage.height);
      //     ctx.globalCompositeOperation = 'source-over';  // restore default comp
      //
      //     imageData = ctx.getImageData(0, 0, theirImage.width, theirImage.height);
      //     imageData = await normal(imageData);
      //     ctx.putImageData(imageData, 0, 0);
      //
      //     return canvas.toBuffer('image/jpeg', undefined);
      //
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },

  // /**
  //  * gets the src image data.
  //  * @param srcImageData the src image data.
  //  * @returns {Promise<void>}
  //  */
  // grayscale: async function(srcImageData) {
  //     const data = srcImageData.data;
  //     for (let i = 0; i < data.length; i += 4) {
  //         let r = data[i];
  //         let g = data[i + 1];
  //         let b = data[i + 2];
  //         let y = 0.299 * r + 0.587 * g + 0.114 * b;
  //         data[i] = y;
  //         data[i + 1] = y;
  //         data[i + 2] = y;
  //     }
  //     return srcImageData;
  // },
  //
  // modifyColors: async function(srcImageData) {
  //     const data = srcImageData.data;
  //     for (let i = 0; i < data.length; i += 4) {
  //         let r = data[i] + 144;
  //         let g = data[i + 1] + 137;
  //         let b = data[i + 2] + 218;
  //         // let y = 0.565 * r + 0.54 * g + 0.855 * b;
  //         data[i] = r;
  //         data[i + 1] = g;
  //         data[i + 2] = b;
  //     }
  //     return srcImageData;
  // }
};

//
// const getBounds = function(val) {
//     return [
//         val,
//         255 - val
//     ];
// };
//
// const normal = function(srcImageData) {
//
//     // store bounds (minimum and maximum values)
//     const data = srcImageData.data;
//
//     for(let idx = 0; idx < data.length; idx++) {
//         const r = data[idx + 0];
//         const g = data[idx + 1];
//         const b = data[idx + 2];
//
//         const bounds = {
//             r: getBounds(r),
//             g: getBounds(g),
//             b: getBounds(b)
//         };
//
//         data[idx + 0] = normalize(r, bounds.r[0], bounds.r[1]);
//         data[idx + 1] = normalize(g, bounds.g[0], bounds.g[1]);
//         data[idx + 2] = normalize(b, bounds.b[0], bounds.b[1]);
//     }
//
//     return srcImageData;
// };
//
// /**
//  * Normalize values
//  * @param  {integer} value Pixel channel value.
//  * @param  {integer} min   Minimum value for channel
//  * @param  {integer} max   Maximum value for channel
//  * @return {integer} normalized values
//  */
// const normalize = function(value, min, max) {
//     const val = ((value - min) * 255) / (max - min);
//     console.log(val);
//     return val;
// };
