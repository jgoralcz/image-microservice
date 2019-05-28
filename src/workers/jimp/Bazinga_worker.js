const Jimp = require('jimp');

module.exports = {
    desiredVal: 480,

    /**
     * generates the image.
     * @param image_url the user's image
     * @param buffer the user's buffer
     * @returns {Promise<*>}
     */

    execute: async function(image_url, buffer) {
        try {
            let overlay = await Jimp.read(Buffer.from(buffer[0]));

            //make new image and resize if necessary
            let newImage = await Jimp.read(image_url);

            //get height and width
            if(newImage.bitmap.width < this.desiredVal) {
                if(newImage.bitmap.height < this.desiredVal) {
                    newImage.resize(this.desiredVal, this.desiredVal);
                }
                else {
                    newImage.resize(Jimp.AUTO, this.desiredVal);
                }
            }
            else if(newImage.bitmap.height < this.desiredVal) {
                newImage.resize(Jimp.AUTO, this.desiredVal);
            }

            //intentional, it's a 480 x 480
            overlay.resize(newImage.bitmap.width, newImage.bitmap.width);

            return await newImage.composite(overlay, 0, -overlay.bitmap.height + newImage.bitmap.height).getBufferAsync(Jimp.MIME_JPEG);

        } catch(error) {
            console.error(error);
        }

        return undefined;
    }
};