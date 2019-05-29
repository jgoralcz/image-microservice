const Jimp = require ('jimp');
const gifFrames = require('gif-frames');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<*>}
     */

    execute: async function (image_url) {
        try {
            //get gif first frame, then jimp read buffer then get base64
            const frames = await gifFrames({url: image_url, frames: 1});

            const image = frames[0].getImage();
            const buff = image._obj;
            const img = await Jimp.read(buff);
            return (await img.getBase64Async(Jimp.MIME_JPEG)).toString();

        }
        catch(error) {
            console.error(error);
        }
        return undefined;
    }
};