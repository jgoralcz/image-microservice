const gf = require('../WorkerHelpers/GeneralizedFunctions.js');

module.exports = {
    rotate: 12,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer[0], 360, 250, this.rotate, 63, 7, 0, 0);
    }
};