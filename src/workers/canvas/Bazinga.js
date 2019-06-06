const { createCanvas, Image, loadImage } = require('canvas');

module.exports = {
    desiredVal: 480,

    /**
     * generates the image.
     * @param images my local image (bazinga)
     * @param image_url the user's image
     * @returns {Promise<*>}
     */

    execute: async function(images, image_url) {
        try {
            // get their image
            const theirImage = await loadImage(image_url);

            let myImage = new Image();
            myImage.src = Buffer.from(images[0]);


            let width = theirImage.width;
            let height = theirImage.height;
            // get height and width to test against
            if(width < this.desiredVal && height < this.desiredVal) {
                height = this.desiredVal;
                width = this.desiredVal;
            }
            else if(height < this.desiredVal) {
                width = width*(height/this.desiredVal);
                height = this.desiredVal;
            }


            let canvas = createCanvas(width, height);
            let ctx = canvas.getContext('2d');

            ctx.drawImage(theirImage, 0, 0, width, height);
            ctx.drawImage(myImage, 0, 0, width, height);

            return canvas.toBuffer('image/jpeg', undefined);


        } catch(error) {
            console.error(error);
        }

        return undefined;
    }
};