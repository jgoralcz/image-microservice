const Jimp = require('jimp');

module.exports = {

    /**
     * generates the image.
     * @param image_url the image url
     * @param filepath the file path the user wants to save
     * @returns {Promise<*>}
     */
    execute: async function(image_url, filepath) {
        try {
            if (!image_url || image_url == null) {
                console.error('no image to save');
                return undefined;
            }
            //read image then write
            const image = await Jimp.read(image_url);
            const file = `./../../../../${filepath}`;
            await image.writeAsync(file);
            return file;
        } catch (error) {
            console.error(error);
        }
        return undefined;
    }
};