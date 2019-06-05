const Jimp = require('jimp');
const { createCanvas, loadImage, createImageData } = require('canvas');

/**
 * deepfries an image
 * algorithm from https://github.com/jorisvddonk/bash-screenshotter/blob/master/index.js
 * @param imageURL
 * @param opacity the opacity to blit the image on
 * @returns {Promise<*>}
 */
module.exports = {

    /**
     * deepfries an image
     * @param imageURL the image url
     * @param opacity the opacity to fry
     * @param saturation the saturation to apply
     * @returns {Promise<*>}
     */
    friedProcess: async (imageURL, opacity, saturation=150) => {

        try {
            const theirImage = await loadImage(imageURL);

            let canvas = createCanvas(theirImage.width, theirImage.height);
            let ctx = canvas.getContext('2d');

            ctx.drawImage(theirImage, 0, 0, theirImage.width, theirImage.height);

            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#ff7f00';
            ctx.fillRect(0, 0, theirImage.width, theirImage.height);
            ctx.globalAlpha = 1.0; // reset

            if(saturation) {
                ctx.globalCompositeOperation = 'saturation';
                ctx.fillStyle = 'hsl(0, 100%, 50%)';
                ctx.fillRect(0, 0, theirImage.width, theirImage.height);
                ctx.globalCompositeOperation = 'source-over';  // restore default comp
            }
            let imageData = ctx.getImageData(0, 0, theirImage.width, theirImage.height);
            imageData = await brightnessContrastPhotoshop(imageData, 32, 40);
            imageData = await dither(imageData, 150);

            ctx.putImageData(imageData, 0, 0);
            imageData = await grain(imageData);
            ctx.putImageData(imageData, 0, 0);

            return canvas.toBuffer('image/jpeg', { quality: 0.18 });

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
};


/**
 * generate some grain
 * @param srcImageData
 * @returns {Promise<void>}
 */
const grain = async (srcImageData) => {
    let dstPixels = srcImageData.data;

    // color grain
    for(let idx = 0; idx < dstPixels.length; idx++) {
        if (Math.random() > 0.98) {
            dstPixels[idx]   = Math.max(128, Math.floor(Math.random() * 255));
            // dstPixels[idx+1] = Math.max(128, Math.floor(Math.random() * 255));
            // dstPixels[idx+2] = Math.max(128, Math.floor(Math.random() * 255));
        }

        if (Math.random() > 0.98) {
            let v = Math.random() * 60;
            dstPixels[idx]   = Math.max(dstPixels[idx] - v, 0);
            // dstPixels[idx+1] = Math.max(dstPixels[idx+1] - v, 0);
            // dstPixels[idx+2] = Math.max(dstPixels[idx+2] - v, 0);
        }
    }

    return srcImageData;
};

/**
 * used from https://github.com/zhengsk/ImageFilters.js/blob/master/imagefilters.js
 * more like the new photoshop algorithm
 * @param srcImageData the source data from canvas
 * @param brightness -100 <= n <= 100
 * @param contrast -100 <= n <= 100
 */
const brightnessContrastPhotoshop = async (srcImageData, brightness, contrast) => {
    let srcPixels    = srcImageData.data,
        srcWidth     = srcImageData.width,
        srcHeight    = srcImageData.height,
        srcLength    = srcPixels.length,
        dstImageData = createImageData(srcWidth, srcHeight),
        dstPixels    = dstImageData.data;

    // fix to 0 <= n <= 2;
    brightness = (brightness + 100) / 100;
    contrast = (contrast + 100) / 100;

    mapRGB(srcPixels, dstPixels, function (value) {
        value *= brightness;
        value = (value - 127.5) * contrast + 127.5;
        return value + 0.5 | 0;
    });
    return dstImageData;
};

const buildMap = function (f) {
    for (var m = [], k = 0, v; k < 256; k += 1) {
        m[k] = (v = f(k)) > 255 ? 255 : v < 0 ? 0 : v | 0;
    }
    return m;
};

const applyMap =  function (src, dst, map) {
    for (var i = 0, l = src.length; i < l; i += 4) {
        dst[i]     = map[src[i]];
        dst[i + 1] = map[src[i + 1]];
        dst[i + 2] = map[src[i + 2]];
        dst[i + 3] = src[i + 3];
    }
};

const mapRGB =  function (src, dst, func) {
    applyMap(src, dst, buildMap(func));
};

const Clone = function (srcImageData) {
    return Copy(srcImageData, createImageData(srcImageData.width, srcImageData.height));
};

const Copy = function (srcImageData, dstImageData) {
    let srcPixels = srcImageData.data,
        srcLength = srcPixels.length,
        dstPixels = dstImageData.data;

    while (srcLength--) {
        dstPixels[srcLength] = srcPixels[srcLength];
    }

    return dstImageData;
};


/**
 * Floyd-Steinberg algorithm
 * @param srcImageData our source data
 * @param levels 2 <= n <= 255
 */
const dither = async (srcImageData, levels) => {
    var srcWidth     = srcImageData.width,
        srcHeight    = srcImageData.height,
        dstImageData = Clone(srcImageData),
        dstPixels    = dstImageData.data;

    levels = levels < 2 ? 2 : levels > 255 ? 255 : levels;

    // Build a color map using the same algorithm as the posterize filter.
    var posterize,
        levelMap = [],
        levelsMinus1 = levels - 1,
        j = 0,
        k = 0,
        i;

    for (i = 0; i < levels; i += 1) {
        levelMap[i] = (255 * i) / levelsMinus1;
    }

    posterize = buildMap(function (value) {
        var ret = levelMap[j];

        k += levels;

        if (k > 255) {
            k -= 255;
            j += 1;
        }

        return ret;
    });

    // Apply the dithering algorithm to each pixel
    var x, y,
        index,
        old_r, old_g, old_b,
        new_r, new_g, new_b,
        err_r, err_g, err_b,
        nbr_r, nbr_g, nbr_b,
        srcWidthMinus1 = srcWidth - 1,
        srcHeightMinus1 = srcHeight - 1,
        A = 7 / 16,
        B = 3 / 16,
        C = 5 / 16,
        D = 1 / 16;

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
            dstPixels[index]     = new_r;
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
                nbr_r = dstPixels[index]     + A * err_r;
                nbr_g = dstPixels[index + 1] + A * err_g;
                nbr_b = dstPixels[index + 2] + A * err_b;

                dstPixels[index]     = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
                dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
                dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
            }

            // x - 1, y + 1
            index += (srcWidth - 2) << 2;
            if (x > 0 && y < srcHeightMinus1) {
                nbr_r = dstPixels[index]     + B * err_r;
                nbr_g = dstPixels[index + 1] + B * err_g;
                nbr_b = dstPixels[index + 2] + B * err_b;

                dstPixels[index]     = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
                dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
                dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
            }

            // x, y + 1
            index += 1 << 2;
            if (y < srcHeightMinus1) {
                nbr_r = dstPixels[index]     + C * err_r;
                nbr_g = dstPixels[index + 1] + C * err_g;
                nbr_b = dstPixels[index + 2] + C * err_b;

                dstPixels[index]     = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
                dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
                dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
            }

            // x + 1, y + 1
            index += 1 << 2;
            if (x < srcWidthMinus1 && y < srcHeightMinus1) {
                nbr_r = dstPixels[index]     + D * err_r;
                nbr_g = dstPixels[index + 1] + D * err_g;
                nbr_b = dstPixels[index + 2] + D * err_b;

                dstPixels[index]     = nbr_r > 255 ? 255 : nbr_r < 0 ? 0 : nbr_r | 0;
                dstPixels[index + 1] = nbr_g > 255 ? 255 : nbr_g < 0 ? 0 : nbr_g | 0;
                dstPixels[index + 2] = nbr_b > 255 ? 255 : nbr_b < 0 ? 0 : nbr_b | 0;
            }
        }
    }

    return dstImageData;
};