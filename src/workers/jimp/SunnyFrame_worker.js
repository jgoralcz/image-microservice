const gf = require('../WorkerHelpers/GeneralizedFunctions.js');

module.exports = {
    rotate: -2,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer[0], 320, 475, this.rotate, 130, 25, 0, 0);
    }
};