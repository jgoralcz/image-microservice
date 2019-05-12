const Jimp = require('jimp');

module.exports = class Rdog {

    constructor() {
        this.imagePath = './assets/images/dog_template.png';
        return (async () => {

            // need async
            this.img = await Jimp.read(this.imagePath);
            this.font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
            // console.log(expServer);

            // expServer.initService();

            return this; // when done
        })();
    }

    /**
     * runs the process for rdog to create an image with the user's text and return the buffer.
     * @param text the user's text.
     * @returns {Promise<*>}
     */
    async process(text) {
        console.log('text', text);
        try {
            return await this.img.print(this.font, 350, 25, text, 280).getBufferAsync(Jimp.MIME_JPEG);
        }
        catch (error) {
            console.error(error);
        }
        return undefined;
    }
};