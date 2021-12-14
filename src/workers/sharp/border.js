const sharp = require('sharp');
const axios = require('axios');

module.exports = {

  async execute(images, imageURL) {
    const [border, snow] = images;
    const { data: buffer } = await axios.get(imageURL, { responseType: 'arraybuffer' });

    return sharp(buffer)
      .composite([{
        input: Buffer.from(border),
      }])
      .resize({ width: 450, height: 700, fit: 'fill' })
      .webp({ quality: 60 })
      .toBuffer();
  },
};
