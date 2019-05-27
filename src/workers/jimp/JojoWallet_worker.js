const gf = require('../../helpers/GeneralizedFunctions.js');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(image_url, buffer) {
        return await gf.modifyImageOverImage(image_url, buffer, 433, 265, 33, 248, -32, 0, 0);
    }
};