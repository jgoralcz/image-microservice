const sharp = require('sharp');

module.exports =  {

    /**
     * sharpens an image
     * @param buffer the buffer image to load in.
     * @param number the number to sharpen by.
     * @returns {buffer}
     */
    execute: function (buffer, number) {
        return sharp(buffer).sharpen(number).toBuffer();
    }
};