const axios = require('axios');
const cv = require('opencv');
const sharp = require('sharp');
const smartcrop = require('smartcrop-sharp');

const faceDetect = (input, userOptions) => new Promise((resolve, reject) => {
  cv.readImage(input, (err, image) => {
    if (err) return reject(err);
    image.detectObject((userOptions.face) ? cv.FACE_CASCADE : cv.ANIME_FACE_CASCADE, {}, (error, faces) => {
      if (error) return reject(error);
      const boost = faces.map((face) => ({
        x: face.x,
        y: face.y,
        width: face.width,
        height: face.height,
        weight: 1.0,
      }));
      resolve(boost);
    });
  });
});

const execute = async (url, width, height, userOptions) => {
  try {
    const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
    const options = await faceDetect(buffer, userOptions).catch(() => null) || { width, height };
    const { topCrop: crop } = await smartcrop.crop(buffer, options);
    return sharp(buffer)
      .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
      .resize(width, height)
      .toBuffer();
  } catch (error) {
    return undefined;
  }

};

module.exports = execute;
