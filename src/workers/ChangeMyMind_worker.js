const line = require('../helpers/getLinesHelper.js');
const { createCanvas, Image } = require('canvas');


module.exports = {
    /**
     * gets the buffer from canvas
     * @param image
     * @param text
     * @returns {Promise<*>}
     */
    getCanvasBuffer: async (image, text) => {

        try {
            //load image as node-canvas data
            let img = new Image();
            img.src = image;

            //get dimensions and specify it's 2d
            let canvas = createCanvas(img.width, img.height);
            let ctx = canvas.getContext('2d');

            //draw image
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const x = text.length;
            //let fontSize = 11;
            let fontSize = 70;
            //ctx.translate(310, 340);
            if (x <= 15) {
                ctx.translate(310, 365);
            }
            else if (x <= 30) {
                fontSize = 50;
                ctx.translate(315, 365);
            }
            else if (x <= 70) {
                fontSize = 40;
                ctx.translate(315, 365);
            }
            else if (x <= 85) {
                fontSize = 32;
                ctx.translate(315, 365);
            }
            else if (x < 100) {
                fontSize = 26;
                ctx.translate(315, 365);
            }
            else if (x < 120) {
                fontSize = 21;
                ctx.translate(315, 365);
            }
            else if (x < 180) {
                //0.000278x^2\ -.177x\ +\ 36.37
                fontSize = 0.0032 * (x * x) - 0.878 * x + 80.545; //before 76.545
                ctx.translate(315, 365);
            }
            else if (x < 700) {
                //y\ =\ 0.00000915x^2\ -\ 0.018x+14.45
                fontSize = 0.0000168 * (x * x) - 0.0319 * x + 23.62;
                ctx.translate(310, 338);
            }
            else {
                fontSize = 7;
                ctx.translate(310, 335);
            }
            ctx.font = `${fontSize}px 'Arial'`;
            ctx.rotate(-0.39575);

            const lines = line.getLines(ctx, text, 345);
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 10, (i * fontSize) - 5);
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