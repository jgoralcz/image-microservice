const { createCanvas, Image, loadImage } = require('canvas');

module.exports = {

    rotate: .3,
    compositeX1: 575,
    compositeY1: 150,
    compositeX2: 800,
    compositeY2: 300,

    /**
     * gets the buffer from canvas
     * @param images the image buffers to hold
     * @param image_url the user's image
     * @returns {Promise<*>}
     */
    execute: async (images, image_url) => {

        try {
            // get their image
            const theirImage = await loadImage(image_url);

            let myImage = new Image();
            myImage.src = Buffer.from(images[0]);

            //get dimensions and specify it's 2d
            let canvas = createCanvas(myImage.width, myImage.height);
            let ctx = canvas.getContext('2d');
            // ctx.quality = 'fast';
            // ctx.patternQuality = 'fast';

            // // rotate if needed
            // rotate
            const x = canvas.width/2;
            const y = canvas.height/2;

            // image 1
            // ctx.translate(x, y);
            // ctx.rotate(this.rotate);
            //
            // ctx.translate(this.compositeX1, this.compositeY1);
            // ctx.drawImage(theirImage, -x, -y, 210, 300);
            // ctx.translate(-this.compositeX1, -this.compositeY1);
            //
            // ctx.rotate(-this.rotate);
            // ctx.translate(-x, -y);

            //image 2
            ctx.translate(x, y);
            ctx.rotate(this.rotate);

            ctx.translate(this.compositeX2, 300);
            ctx.drawImage(theirImage, -x, -y, 350, 250);
            ctx.translate(-this.compositeX2, -this.compositeY2);

            ctx.rotate(-this.rotate);
            ctx.translate(-x, -y);

            ctx.drawImage(myImage, 0, 0, myImage.width, myImage.height);


            return canvas.toBuffer('image/jpeg', undefined);

        } catch (error) {
            console.error('canvas helper error:', error);
        }
        return undefined;
    }
};