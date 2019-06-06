const { createCanvas, loadImage } = require('canvas');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image to load as a buffer
     * @returns {Promise<*>}
     */

    execute: async function(image_url) {
        try {
            // get their image
            const theirImage = await loadImage(image_url);

            const canvas = createCanvas(theirImage.width, theirImage.height);
            let ctx = canvas.getContext('2d');

            ctx.drawImage(theirImage, 0, 0, theirImage.width, theirImage.height);

            return canvas.toBuffer('image/jpeg', undefined);



        } catch (error) {
            console.error(error);
        }

        return undefined;
    }
};