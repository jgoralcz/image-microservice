const line = require('../WorkerHelpers/GetLinesHelper.js');
const { createCanvas, Image } = require('canvas');


module.exports = {
    /**
     * gets the buffer from canvas
     * @param images buffer image
     * @param text the user's text
     * @returns {Promise<*>}
     */
    execute: async (images, text) => {

        try {
            //load image as node-canvas data
            let img = new Image();
            img.src = Buffer.from(images[0]);

            //get dimensions and specify it's 2d
            let canvas = createCanvas(img.width, img.height);
            let ctx = canvas.getContext('2d');

            //draw image
            ctx.drawImage(img, 0, 0, img.width, img.height);

            ctx.translate(350, 25);

            let fontSize = 28;

            ctx.font = `${fontSize}px 'Arial'`;
            const lines = line.getLines(ctx, text, 275);
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 0, (i * fontSize));
            }

            return canvas.toBuffer('image/jpeg', undefined);
        }
        catch (error) {
            console.error(error);
        }
        return undefined;
    }
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.