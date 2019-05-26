const gf = require('../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 807,
    y: 591,
    rotate: -7.75,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 228, 370, this.rotate, 312, 190, 0, 0);
    }
};