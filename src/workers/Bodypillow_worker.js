const gf = require('../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 469,
    y: 700,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 105, 115, 0, 220, 130, 0, 0);
    }
};