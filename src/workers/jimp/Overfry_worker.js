const Jimp = require('jimp');
const ofp = require('../WorkerHelpers/OverfriedHelper');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<void>}
     */
    execute: async function(image_url) {
        try {
            //get image then get buffer after contrast
            const image = await ofp.friedProcess(image_url, 0.48, 150);
            if(image) {
                return await image.getBufferAsync(Jimp.MIME_JPEG);
            }
        } catch(error) {
            console.error(error);
        }
    }
};