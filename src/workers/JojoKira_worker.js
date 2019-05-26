const gf = require('../helpers/GeneralizedFunctions.js');

module.exports = {
    x: 1207,
    y: 701,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, this.x, this.y, 285, 430, -20, 770, 75, 0, 0);
    }
};