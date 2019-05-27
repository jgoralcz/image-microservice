const Jimp = require('jimp');
const ofp = require('../../helpers/OverfriedHelper');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<void>}
     */
    execute: async function(image_url) {
        try {
            //get image then get buffer after contrast
            let image = await ofp.friedProcess(image_url, 0.43, 0);
            if(image) {
                return await image.getBufferAsync(Jimp.MIME_JPEG);
            }
        } catch(error) {
            console.error(error);
        }
    }
};