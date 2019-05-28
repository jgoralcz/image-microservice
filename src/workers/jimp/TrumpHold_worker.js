const gf = require('../WorkerHelpers/GeneralizedFunctions.js');

module.exports = {
    rotate: -7.75,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer[0], 228, 370, this.rotate, 312, 190, 0, 0);
    }
};