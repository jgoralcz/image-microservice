const Jimp = require('jimp');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<*>}
     */

    execute: async function(image_url) {
        try {
            const image = await Jimp.read(image_url);

            while (image.bitmap.width > 800 || image.bitmap.height > 800) {
                image.scale(0.6);
            }

            image.grayscale();
            image.brightness(-0.2);

            image.color([
                {apply: 'red', params: [114]},
                {apply: 'green', params: [137]},
                {apply: 'blue', params: [218]},
                // {apply: 'saturate', params: [20]},
                // {apply: 'mix', params: [90]}
            ]);
            // image.contrast(0.475);
            image.normalize();
            image.quality(80);

            return await image.getBufferAsync(Jimp.MIME_JPEG);

        } catch (error) {
            console.error(error);
        }

        return undefined;
    }
};