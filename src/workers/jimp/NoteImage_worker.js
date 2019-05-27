const gf = require('../../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 778,
    y: 736,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 240, 220, 30, 320, 371, 0, 0);
    }
};