const Jimp = require('jimp');

module.exports = {

    /**
     *
     * @param image the user's image
     * @param title the title to find the image in my folder
     * @param resizeX resize the user's image x direction
     * @param resizeY resize the user's image y direction
     * @param rotate
     * @param compositeX1
     * @param compositeY1
     * @param compositeX2
     * @param compositeY2
     * @param rotateFirst whether or not to rotate first
     * @param doNotCompositeTwice whether or not to composite twice, true means do not do it
     * @returns {Promise<void>}
     */
    modifyImageOverImage: async (image, title, resizeX, resizeY, rotate, compositeX1, compositeY1, compositeX2, compositeY2, rotateFirst, doNotCompositeTwice) => {
        try {
            // get our image template
            const underImage = await Jimp.read(`./assets/images/${title}`);

            // read in our new image
            let newImage = await Jimp.read(image);


            // jimp has weird things when rotating
            if(rotateFirst) {
                if(rotate) {
                    newImage.scale(3);
                    newImage.rotate(rotate);
                    newImage.scale(.333);
                }
            }
            if(resizeX && resizeY) {
                newImage = newImage.resize(resizeX, resizeY);
            }
            if(!rotateFirst) {
                if(rotate) {
                    newImage.scale(3);
                    newImage.rotate(rotate);
                    newImage.scale(.333);
                }
            }

            let overlay;
            if(!doNotCompositeTwice) {
                overlay = underImage.clone();
            }

            //modify the image and then the buffer
            let content = await underImage.composite(newImage, compositeX1, compositeY1);

            if(!doNotCompositeTwice) {
                content = await content.composite(overlay, compositeX2, compositeY2);
            }

            return content.getBufferAsync(Jimp.MIME_JPEG);

        }catch(error) {
            console.error(error);
        }
        return undefined;
    }
};