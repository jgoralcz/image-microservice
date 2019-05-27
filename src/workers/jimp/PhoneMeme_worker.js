const gf = require('../../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 1002,
    y: 1200,
    rotate: -14,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 400, 600, this.rotate, 500, 600, 0, 0);
    }
};