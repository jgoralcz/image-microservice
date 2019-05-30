const Jimp = require('jimp');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image to load as a buffer
     * @returns {Promise<*>}
     */

    execute: async function(image_url) {
        try {
            let image = await Jimp.read(image_url);

            //scale for faster processing
            if (image.bitmap.width > 750 || image.bitmap.height > 750) {
                image.scale(0.5);
            }

            return await image.getBufferAsync(Jimp.MIME_JPEG);


        } catch (error) {
            console.error(error);
        }

        return undefined;
    }
};