const gf = require('../WorkerHelpers/GeneralizedFunctions.js');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer[0], 105, 115, 0, 220, 130, 0, 0);
    }
};