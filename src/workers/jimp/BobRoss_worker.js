const gf = require('../WorkerHelpers/GeneralizedFunctions.js');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer[0], 455, 400, -2, 5, 36, 0, 0);
    }
};