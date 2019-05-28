const line = require('../../helpers/GetLinesHelper.js');
const { createCanvas, Image } = require('canvas');


module.exports = {
    /**
     * gets the buffer from canvas
     * @param images the buffer images.
     * @param text the user's texts.
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
            ctx.rotate(-0.05);

            // get font size
            const x = text.length;
            let fontSize = 100;
            if (x <= 15) {
                ctx.translate(175, 420);
                // do nothing
            }
            else if (x <= 30) {
                fontSize = 85;
                ctx.translate(180, 400);
            }
            else if (x <= 70) {
                fontSize = 60;
                ctx.translate(180, 400);
            }
            else if (x <= 85) {
                fontSize = 55;
                ctx.translate(180, 400);
            }
            else if (x < 100) {
                fontSize = 48;
                ctx.translate(180, 400);
            }
            else if (x < 120) {
                fontSize = 40;
                ctx.translate(180, 400);
            }
            else if (x < 150) {
                //0.000278x^2\ -.177x\ +\ 36.37
                fontSize = 0.0032 * (x * x) - 0.748 * x + 70.545; //before 76.545
                ctx.translate(180, 400);
            }
            else if (x < 700) {
                //y\ =\ 0.00000915x^2\ -\ 0.018x+14.45
                fontSize = 0.0000168 * (x * x) - 0.0369 * x + 35.62;
                ctx.translate(180, 400);
            }
            else {
                fontSize = 14;
                ctx.translate(180, 400);
            }

            ctx.font = `${fontSize}px 'Helvetica'`;

            const lines = line.getLines(ctx, text, 440);
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 10, (i * (fontSize + 10)) + 5);
            }

            return canvas.toBuffer('image/jpeg', undefined);

        } catch (error) {
            console.error(error);
        }

        return undefined;
    }
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.