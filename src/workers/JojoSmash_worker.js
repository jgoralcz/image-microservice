const gf = require('../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 400,
    y: 673,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 355, 225, 0, 0, 230, 0, 0);
    }
};