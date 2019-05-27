const Jimp = require('jimp');


module.exports = {
    font: './assets/fonts/CurseCasual.fnt',

    /**
     *
     * @param text
     * @param buffer
     * @returns {Promise<*>}
     */
    execute: async function(text, buffer) {
        try {
            //load images and font
            let img = await Jimp.read(Buffer.from(buffer));
            const font = await Jimp.loadFont(this.font);

            // print and return new buffer
            img = await img.print(font, 500, 300, text, 900);
            return await img.getBufferAsync(Jimp.MIME_JPEG);
        }
        catch (error) {
            console.error(error);
        }
        return undefined;
    }
};