const Jimp = require('jimp');

module.exports = {

    /**
     * generates the image.
     * @param image_url the user's image
     * @param threshold the threshold to add
     * @returns {Promise<*>}
     */

    execute: async function(image_url, threshold = 0) {
        try {

            const image = await Jimp.read(image_url);

            while (image.bitmap.width > 800 || image.bitmap.height > 800) {
                image.scale(0.6);
            }

            image.grayscale();
            image.brightness(-0.32);
            image.contrast(0.30);

            image.color([
                {apply: 'red', params: [219]},
                {apply: 'green', params: [120]},
                {apply: 'blue', params: [0]},
                // {apply: 'saturate', params: [3]},
                // {apply: 'mix', params: [90]}
            ]);
            // image.contrast(0.155);
            image.normalize();
            image.quality(80);


            //if white background used from https://github.com/oliver-moran/jimp/issues/395
            // if(threshold > 0) {
            //     const targetColor = {r: 255, g: 255, b: 255, a: 255};  // Color you want to replace
            //     const replaceColor = {r: 35, g: 35, b: 35, a: 60};  // Color you want to replace with
            //     const colorDistance = (c1, c2) => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2) + Math.pow(c1.a - c2.a, 2));  // Distance between two colors
            //     image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
            //         const thisColor = {
            //             r: image.bitmap.data[idx + 0],
            //             g: image.bitmap.data[idx + 1],
            //             b: image.bitmap.data[idx + 2],
            //             a: image.bitmap.data[idx + 3]
            //         };
            //         if (colorDistance(targetColor, thisColor) <= threshold) {
            //             image.bitmap.data[idx + 0] = replaceColor.r;
            //             image.bitmap.data[idx + 1] = replaceColor.g;
            //             image.bitmap.data[idx + 2] = replaceColor.b;
            //             image.bitmap.data[idx + 3] = replaceColor.a;
            //         }
            //     });
            // }

            return await image.getBufferAsync(Jimp.MIME_JPEG);
        } catch(error) {
            console.error(error);
        }

        return undefined;
    }
};