const Jimp = require('jimp');

module.exports = {
  async execute(imageURL, threshold = 0, r, g, b) {
    try {
      const image = await Jimp.read(imageURL);

      while (image.bitmap.width > 800 || image.bitmap.height > 800) {
        image.scale(0.6);
      }

      image.grayscale();
      // image.contrast(0.12);
      image.normalize();
      image.color([
        { apply: 'red', params: [r] },
        { apply: 'green', params: [g] },
        { apply: 'blue', params: [g] },
        // {apply: 'saturate', params: [3]},
        // {apply: 'mix', params: [90]}
      ]);
      image.quality(80);

      // if white background used from https://github.com/oliver-moran/jimp/issues/395
      if (threshold > 0) {
        const targetColor = {
          r: 255, g: 255, b: 255, a: 255,
        }; // Color you want to replace
        const replaceColor = {
          r, g, b, a: 60,
        }; // Color you want to replace with by calculating the distance between two colors.
        const colorDistance = (c1, c2) => Math.sqrt(((c1.r - c2.r) * (c1.r - c2.r) + (c1.g - c2.g) * (c1.g - c2.g)
          + (c1.b - c2.b) * (c1.b - c2.b) + (c1.a - c2.a) * (c1.a - c2.a)));
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
          const thisColor = {
            r: image.bitmap.data[idx],
            g: image.bitmap.data[idx + 1],
            b: image.bitmap.data[idx + 2],
            a: image.bitmap.data[idx + 3],
          };
          if (colorDistance(targetColor, thisColor) <= threshold) {
            image.bitmap.data[idx] = replaceColor.r;
            image.bitmap.data[idx + 1] = replaceColor.g;
            image.bitmap.data[idx + 2] = replaceColor.b;
            image.bitmap.data[idx + 3] = replaceColor.a;
          }
        });
      }

      return image.getBufferAsync(Jimp.MIME_JPEG);
    } catch (error) {
      console.error(error);
    }

    return undefined;
  },
};
