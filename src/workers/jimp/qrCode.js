const qr = require('qr-image');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<*>}
     */

    execute: async function (image_url) {
        try {
            return await qr.imageSync(image_url, {type: 'png'});
        }
        catch(error) {
            console.error(error);
        }

        return undefined;
    }
};