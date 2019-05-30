const imageToAscii = require('image-to-ascii');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @returns {Promise<*>}
     */

    execute: async function (image_url) {

        // make new promise because the package is dumb
        return await new Promise( (resolve, reject) => {
            imageToAscii(image_url, {
                colored: false,
                pxWidth: 2,
                size: {
                    height: '100%'
                    //the width is computed to keep aspect ratio
                },
                size_options: {
                    screen_size: {
                        width: 60,
                        height: 60
                    }
                },
                preserve_aspect_ratio: true,
                fit_screen: true
            }, async (err, converted) => {

                if(converted) {
                    resolve(converted);
                }

                //did not work
                else {
                    reject(err);
                }
            });
        });
    }
};

// would be cool if I could somehow use these colors to my advantage, but it only looks nice in the terminal :(