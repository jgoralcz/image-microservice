const { createCanvas, loadImage, createImageData } = require('canvas');

/**
 * fries an image
 * algorithm from https://github.com/jorisvddonk/bash-screenshotter/blob/master/index.js
 * @param imageURL
 * @param opacity the opacity to blit the image on
 * @returns {Promise<*>}
 */
module.exports = {

  /**
   * fries an image
   * @param imageURL the image url
   * @param opacity the opacity to fry
   * @param color the color to apply
   * @returns {Promise<*>}
   */
  async execute(imageURL, opacity, color = '#ff6600') {
    try {
      const theirImage = await loadImage(imageURL);

      const canvas = createCanvas(theirImage.width, theirImage.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(theirImage, 0, 0, theirImage.width, theirImage.height);

      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, theirImage.width, theirImage.height);
      ctx.globalAlpha = 1.0; // reset


      // saturation
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = 'hsl(0, 100%, 50%)';
      ctx.fillRect(0, 0, theirImage.width, theirImage.height);
      ctx.globalCompositeOperation = 'source-over'; // restore default comp

      let imageData = ctx.getImageData(0, 0, theirImage.width, theirImage.height);
      imageData = await this.brightnessContrastPhotoshop(imageData, 32, 40); // 32, 40 for fry
      // imageData = await this.dither(imageData, 200);

      ctx.putImageData(imageData, 0, 0);
      imageData = await this.grain(imageData);
      ctx.putImageData(imageData, 0, 0);

      return canvas.toBuffer('image/jpeg', { quality: 0.5 });
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },

  /**
     * generate some grain
     * @param srcImageData
     * @returns {Promise<void>}
     */
  grain: async (srcImageData) => {
    const dstPixels = srcImageData.data;

    // color grain
    for (let idx = 0; idx < dstPixels.length; idx++) {
      if (Math.random() > 0.98) {
        dstPixels[idx] = Math.max(128, Math.floor(Math.random() * 255));
        dstPixels[idx + 1] = Math.max(128, Math.floor(Math.random() * 255));
        // dstPixels[idx+2] = Math.max(128, Math.floor(Math.random() * 255));
      }

      if (Math.random() > 0.98) {
        const v = Math.random() * 60;
        dstPixels[idx] = Math.max(dstPixels[idx] - v, 0);
        // dstPixels[idx+1] = Math.max(dstPixels[idx+1] - v, 0);
        // dstPixels[idx+2] = Math.max(dstPixels[idx+2] - v, 0);
      }
    }

    return srcImageData;
  },

  /**
     * used from https://github.com/zhengsk/ImageFilters.js/blob/master/imagefilters.js
     * more like the new photoshop algorithm
     * @param srcImageData the source data from canvas
     * @param brightness -100 <= n <= 100
     * @param contrast -100 <= n <= 100
     */
  async brightnessContrastPhotoshop(srcImageData, brightness, contrast) {
    const srcPixels = srcImageData.data;
    const srcWidth = srcImageData.width;
    const srcHeight = srcImageData.height;
    const dstImageData = createImageData(srcWidth, srcHeight);
    const dstPixels = dstImageData.data;

    // fix to 0 <= n <= 2;
    brightness = (brightness + 100) / 100;
    contrast = (contrast + 100) / 100;

    this.mapRGB(srcPixels, dstPixels, (value) => {
      value *= brightness;
      value = (value - 127.5) * contrast + 127.5;
      return value + 0.5 | 0;
    });
    return dstImageData;
  },

  buildMap(f) {
    const m = [];
    for (let k = 0, v; k < 256; k += 1) {
      m[k] = (v = f(k)) > 255 ? 255 : v < 0 ? 0 : v | 0;
    }
    return m;
  },

  applyMap(src, dst, map) {
    for (let i = 0, l = src.length; i < l; i += 4) {
      dst[i] = map[src[i]];
      dst[i + 1] = map[src[i + 1]];
      dst[i + 2] = map[src[i + 2]];
      dst[i + 3] = src[i + 3];
    }
  },

  mapRGB(src, dst, func) {
    this.applyMap(src, dst, this.buildMap(func));
  },

  Clone(srcImageData) {
    return this.Copy(srcImageData, createImageData(srcImageData.width, srcImageData.height));
  },

  Copy(srcImageData, dstImageData) {
    const srcPixels = srcImageData.data;
    let srcLength = srcPixels.length;
    const dstPixels = dstImageData.data;

    while (srcLength--) {
      dstPixels[srcLength] = srcPixels[srcLength];
    }

    return dstImageData;
  },


  /**
   * Floyd-Steinberg algorithm
   * @param srcImageData our source data
   * @param levels 2 <= n <= 255
   */
  async dither(srcImageData, levels) {
    const srcWidth = srcImageData.width;
    const srcHeight = srcImageData.height;
    const dstImageData = this.Clone(srcImageData);
    const dstPixels = dstImageData.data;

    levels = levels < 2 ? 2 : levels > 255 ? 255 : levels;

    // Build a color map using the same algorithm as the posterize filter.
    let posterize;
    const levelMap = [];
    const levelsMinus1 = levels - 1;
    let j = 0;
    let k = 0;
    let i;

    for (i = 0; i < levels; i += 1) {
      levelMap[i] = (255 * i) / levelsMinus1;
    }

    posterize = this.buildMap((value) => {
      const ret = levelMap[j];

      k += levels;

      if (k > 255) {
        k -= 255;
        j += 1;
      }

      return ret;
    });

    // Apply the dithering algorithm to each pixel
    let x; let y;
    let index;
    let old_r; let old_g; let old_b;
    let new_r; let new_g; let new_b;
    let err_r; let err_g; let err_b;
    let nbr_r; let nbr_g; let nbr_b;
    const srcWidthMinus1 = srcWidth - 1;
    const srcHeightMinus1 = srcHeight - 1;
    const A = 7 / 16;
    const B = 3 / 16;
    const C = 5 / 16;
    const D = 1 / 16;

    for (y = 0; y < srcHeight; y += 1) {
      for (x = 0; x < srcWidth; x += 1) {
        // Get the current pixel.
        index = (y * srcWidth + x) << 2;

        old_r = dstPixels[index];
        old_g = dstPixels[index + 1];
        old_b = dstPixels[index + 2];

        // Quantize using the color map
        new_r = posterize[old_r];
        new_g = posterize[old_g];
        new_b = posterize[old_b];

        // Set the current pixel.
        dstPixels[index] = new_r;
        dstPixels[index + 1] = new_g;
        dstPixels[index + 2] = new_b;

        // Quantization errors
        err_r = old_r - new_r;
        err_g = old_g - new_g;
        err_b = old_b - new_b;

        // Apply the matrix.
        // x + 1, y
        index += 1 << 2;
        if (x < srcWidthMinus1) {
          nbr_r = dstPixels[index] + A * err_r;
          nbr_g = dstPixels[index + 1] + A * err_g;
          nbr_b = dstPixels[index + 2] + A * err_b;

          dstPixels[index] = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
          dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
          dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
        }

        // x - 1, y + 1
        index += (srcWidth - 2) << 2;
        if (x > 0 && y < srcHeightMinus1) {
          nbr_r = dstPixels[index] + B * err_r;
          nbr_g = dstPixels[index + 1] + B * err_g;
          nbr_b = dstPixels[index + 2] + B * err_b;

          dstPixels[index] = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
          dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
          dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
        }

        // x, y + 1
        index += 1 << 2;
        if (y < srcHeightMinus1) {
          nbr_r = dstPixels[index] + C * err_r;
          nbr_g = dstPixels[index + 1] + C * err_g;
          nbr_b = dstPixels[index + 2] + C * err_b;

          dstPixels[index] = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
          dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
          dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
        }

        // x + 1, y + 1
        index += 1 << 2;
        if (x < srcWidthMinus1 && y < srcHeightMinus1) {
          nbr_r = dstPixels[index] + D * err_r;
          nbr_g = dstPixels[index + 1] + D * err_g;
          nbr_b = dstPixels[index + 2] + D * err_b;

          dstPixels[index] = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
          dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
          dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
        }
      }
    }

    return dstImageData;
  },
};
