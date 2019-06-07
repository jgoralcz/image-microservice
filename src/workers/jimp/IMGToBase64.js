const Jimp = require ('jimp');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<*>}
     */

    execute: async function (image_url) {
        try {

            //get gif first frame, then jimp read buffer then get base64
            const img = await Jimp.read(image_url);
            return await img.scale(0.5).quality(70).getBase64Async(Jimp.MIME_JPEG);
        }
        catch(error) {
            console.error(error);
        }

        return undefined;
    }
};