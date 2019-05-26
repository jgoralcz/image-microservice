const Jimp = require('jimp');

module.exports = {
    scale: 2.25,
    unscale: 1/2.25,

    /**
     *
     * @param image the user's image
     * @param buffer my preloaded image
     * @param templateX the template's X size
     * @param templateY the template's Y size
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
    modifyImageOverImage: async function (image, buffer, templateX, templateY, resizeX, resizeY, rotate, compositeX1,
                                          compositeY1, compositeX2, compositeY2, rotateFirst, doNotCompositeTwice) {
        try {
            // read the template
            const template = await Jimp.read(Buffer.from(buffer));
            const underImage = await new Jimp(templateX, templateY, 0x0);

            // read in our new image
            let newImage = await Jimp.read(image);


            // jimp has weird things when rotating
            if(rotateFirst && rotate) {
                newImage.scale(this.scale);
                newImage.rotate(rotate);
                newImage.scale(this.unscale);
            }

            if(resizeX && resizeY) {
                newImage = newImage.resize(resizeX, resizeY);
            }

            if(!rotateFirst && rotate) {
                newImage.scale(this.scale);
                newImage.rotate(rotate);
                newImage.scale(this.unscale);
            }

            let overlay;
            if(!doNotCompositeTwice) {
                overlay = template.clone();
            }

            //modify the image and then the buffer
            let content = await underImage.composite(newImage, compositeX1, compositeY1);

            if(!doNotCompositeTwice) {
                content = await content.composite(overlay, compositeX2, compositeY2);
            }

            // don't have to send over so much data
            content.quality(75);

            return content.getBufferAsync(Jimp.MIME_JPEG);

        } catch(error) {
            console.error(error);
        }
        return undefined;
    }
};