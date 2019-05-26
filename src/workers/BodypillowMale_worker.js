const gf = require('../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 316,
    y: 382,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 75, 75, 0, 100, 79, 0, 0);
    }
};