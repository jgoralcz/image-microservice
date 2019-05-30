const line = require('../WorkerHelpers/GetLinesHelper.js');
const { createCanvas, Image } = require('canvas');
const { formatTwitterTime } = require('../WorkerHelpers/FormatTwitterTime.js');


module.exports = {
    /**
     * gets the buffer from canvas
     * @param images our image
     * @param text the user's text
     * @returns {Promise<*>}
     */
    getCanvasBuffer: async (images, text) => {

        try {
            let img = new Image();
            img.src = images[0];

            //get dimensions and specify it's 2d
            let canvas = createCanvas(img.width, img.height);
            let ctx = canvas.getContext('2d');


            //draw image
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const fontSize = 48;
            ctx.font = `${fontSize}px 'Helvetica'`;

            const lines = line.getLines(ctx, text, 1140);
            for(let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], 75, (i*(fontSize+10))+220);
            }

            //add date and time
            //draw image
            const fontSize2 = 24;
            ctx.font = `${fontSize2}px 'Helvetica'`;
            ctx.fillStyle = '#657786';
            ctx.fillText(await formatTwitterTime(), 75, img.height - 30);

            return await canvas.toBuffer('image/jpeg', undefined);

        } catch(error) {
            console.error(error);
        }
        return undefined;
    }
};
// worker doesn't work with canvas, send buffer and apply other methods if needed.