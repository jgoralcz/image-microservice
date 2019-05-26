const Jimp = require('jimp');

module.exports = {

    /**
     * generates the image.
     * @param text the user's text
     * @param buffer our buffer image
     * @returns {Promise<void>}
     */
    execute: async function(text, buffer) {
        const template = await Jimp.read(buffer);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        buffer = await template.print(font, 350, 25, text, 280);
        return await buffer.getBufferAsync(Jimp.MIME_JPEG);

    }
};