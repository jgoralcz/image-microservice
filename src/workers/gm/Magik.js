const axios = require('axios');
const im = require('gm').subClass({ imageMagick: true });
const sharp = require('sharp');

const execute = async (url) => {
  const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  const metadata = await sharp(buffer).metadata();

  return new Promise((resolve, reject) => {
    im(buffer)
      .coalesce()
      .resize(200, 200)
      // .selectFrame(0)
      .in('-liquid-rescale', Math.round(metadata.width / 2), Math.round(metadata.height / 2), '2', '0')
      .in('-liquid-rescale', Math.round(metadata.width * 1.5), Math.round(metadata.height * 1.5), '2', '0')
      .implode(0.4)
      .quality(60)
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  });
};


module.exports = execute;
