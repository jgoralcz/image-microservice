const line = require('../WorkerHelpers/GetLinesHelper.js');
const { createCanvas, Image } = require('canvas');

module.exports = {
    /**
     * gets the buffer from canvas
     * @param images the images buffer
     * @param text the image text
     * @returns {Promise<*>}
     */
    getCanvasBuffer: async (images, text) => {

        try {
            //load image as node-canvas data
            let img = new Image();
            img.src = images[0];

            //get dimensions and specify it's 2d
            let canvas = createCanvas(img.width, img.height);
            let ctx = canvas.getContext('2d');

            //draw image
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const x = text.length;
            let fontSize = 53;
            if (x < 15) {
                ctx.translate(565, 300);
            }
            else if (x < 25) {
                fontSize = 42;
                ctx.translate(565, 300);
            }
            else if (x < 370) {
                //0.000278x^2\ -.177x\ +\ 36.37
                fontSize = Math.floor(0.0003 * (x * x) - 0.1875 * x + 40.37);
                ctx.translate(565, 285);
            }
            else if (x < 1300) {
                //y\ =\ 0.00000915x^2\ -\ 0.018x+14.45
                fontSize = Math.floor(0.00000915 * (x * x) - 0.018 * x + 17.45);
                ctx.translate(565, 275);
            }
            else {
                fontSize = 4.5;
                ctx.translate(565, 290);
            }
            ctx.font = `${fontSize}px 'Arial'`;
            ctx.rotate(0.12);
            const lines = line.getLines(ctx, text, 175);
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