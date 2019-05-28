const gf = require('../WorkerHelpers/GeneralizedFunctions.js');

module.exports = {
    rotate: -14,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer[0], 400, 600, this.rotate, 500, 600, 0, 0);
    }
};