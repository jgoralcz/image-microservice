const Jimp = require('jimp');

module.exports = {

    /**
     * 2 images for homie.
     * @param buffer the buffer
     * @param image_url the image url
     * @returns {Promise<*>}
     */
    execute: async function(buffer, image_url) {

        try {

            // create images
            const underImage = await Jimp.read(Buffer.from(buffer[0]));
            let newImage = await Jimp.read(image_url);
            const overlay = underImage.clone();


            // new images based off rotations and resizes to overlay
            newImage = newImage.resize(210, 200).rotate(25);
            let newImage2 = newImage.clone();
            newImage2 = newImage2.resize(290, 250);

            return await underImage.composite(newImage, 130, 150).composite(newImage2, 375, 75).composite(overlay, 0, 0).getBufferAsync(Jimp.MIME_JPEG);

        } catch(error) {
            console.error(error);
        }

        return undefined;
    }
};