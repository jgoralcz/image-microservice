const Jimp = require('jimp');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @param number the number
     * @returns {Promise<*>}
     */

    execute: async function(image_url, number = 3) {
        try {
            let image = await Jimp.read(image_url);

            if(number === 0) number = 3;

            //scale for faster processing
            if (image.bitmap.width > 600 || image.bitmap.height > 600) {
                image.scale(0.5);
            }

            return await image.pixelate(number).getBufferAsync(Jimp.MIME_JPEG);


        } catch (error) {
            console.error(error);
        }

        return undefined;
    }
};