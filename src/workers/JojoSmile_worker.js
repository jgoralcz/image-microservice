const gf = require('../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 500,
    y: 563,
    rotate: 12,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 360, 250, this.rotate, 63, 7, 0, 0, true);
    }
};