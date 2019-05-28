const Jimp = require('jimp');

module.exports = {

    /**
     *
     * @param text
     * @param buffer
     * @returns {Promise<*>}
     */
    execute: async function(text, buffer) {
        try {

            let image = await Jimp.read(Buffer.from(buffer));
            const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

            image = await image.print(font, 260, 180, text, 570);
            return await image.getBufferAsync(Jimp.MIME_JPEG);

        } catch(error) {
            console.error(error);
        }
        return undefined;
    }
};