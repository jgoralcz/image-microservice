const sharp = require('sharp');
const axios = require('axios');

module.exports = {

  async execute(images, imageURL) {
    const [border, snow] = images;
    const { data: buffer } = await axios.get(imageURL, { responseType: 'arraybuffer' });

    const bufferSnow = await sharp(buffer)
      .composite([{
        input: Buffer.from(snow),
        blend: 'overlay',
      }])
      .resize({ width: 450, height: 700, fit: 'fill' })
      .toBuffer();

    return sharp(bufferSnow)
      .composite([{
        input: Buffer.from(border),
      }])
      .resize({ width: 450, height: 700, fit: 'fill' })
      .webp({ quality: 50 })
      .toBuffer();
  },
};
