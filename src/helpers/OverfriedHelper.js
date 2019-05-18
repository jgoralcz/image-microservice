const Jimp = require('jimp');

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
            const image = await Jimp.read(imageURL);

            while (image.bitmap.width > 800 || image.bitmap.height > 800) {
                image.scale(0.5);
            }
            image.scale(0.80);

            const img = await new Jimp(image.bitmap.width, image.bitmap.height, '#ff7f00');

            img.opacity(opacity);
            image.composite(img, 0, 0);

            if(saturation) {
                image.color([
                    {apply: 'saturate', params: [150]}
                ]);
            }
            image.scale(1.25);
            image.contrast(0.40);
            image.brightness(0.32);
            //255, 127, 0
            // image.dither(150, Jimp.AUTO);
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, noiseDark);
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, noiseColor);
            image.normalize();
            image.quality(40);
            return image;

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
};


/**
 * darkennoise takes in a bitmap and randomizes pixels to have dark noise on it
 * @param x
 * @param y
 * @param idx
 * @returns {Promise<void>}
 */
const noiseDark = function (x, y, idx) {

    if (Math.random() > 0.98) {
        let v = Math.random() * 60;
        this.bitmap.data[idx]   = Math.max(this.bitmap.data[idx+0] - v, 0);
        this.bitmap.data[idx+1] = Math.max(this.bitmap.data[idx+1] - v, 0);
        this.bitmap.data[idx+2] = Math.max(this.bitmap.data[idx+2] - v, 0);

        this.bitmap.data[idx]   = Math.max(128, Math.floor(Math.random() * 255));
        this.bitmap.data[idx+1] = Math.max(128, Math.floor(Math.random() * 255));
        this.bitmap.data[idx+2] = Math.max(128, Math.floor(Math.random() * 255));
    }
};

/**
 * colorednoise takes in a bitmap and performs color operations on it.
 * @param x
 * @param y
 * @param idx
 */
const noiseColor = function (x, y, idx) {
    if (Math.random() > 0.98) {
        this.bitmap.data[idx]   = Math.max(128, Math.floor(Math.random() * 255));
        this.bitmap.data[idx+1] = Math.max(128, Math.floor(Math.random() * 255));
        this.bitmap.data[idx+2] = Math.max(128, Math.floor(Math.random() * 255));
    }
};