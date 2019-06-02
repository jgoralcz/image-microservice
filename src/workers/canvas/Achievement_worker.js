const { createCanvas, Image } = require('canvas');


module.exports = {
    /**
     * gets the buffer from canvas
     * @param images the image buffers to hold
     * @param text the user's text
     * @returns {Promise<*>}
     */
    getCanvasBuffer: async (images, text) => {

        try {

            //load image as node-canvas data
            let img = new Image();
            img.src = Buffer.from(images[0]);

            //get dimensions and specify it's 2d
            let canvas = createCanvas(img.width, img.height);
            let ctx = canvas.getContext('2d');

            //draw image
            ctx.drawImage(img, 0, 0, img.width, img.height);

            ctx.translate(120, 60);
            ctx.font = `24px 'Arial'`;
            ctx.fillStyle = 'white';

            ctx.fillText(text, 10, 22, 330);

            return canvas.toBuffer('image/jpeg', undefined);

        } catch (error) {
            console.error(error);
        }
        return undefined;
    }
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.