const axios = require('axios');
const cv = require('opencv');
const gm = require('gm').subClass({ imageMagick: true });
const smartcrop = require('smartcrop-gm');
const sharp = require('sharp');

const faceDetect = (input, userOptions) => new Promise((resolve, reject) => {
  cv.readImage(input, (err, image) => {
    if (err) return reject(err);
    return image.detectObject((userOptions.face) ? cv.FACE_CASCADE : cv.ANIME_FACE_CASCADE, {}, (error, faces) => {
      if (error) return reject(error);
      const boost = faces.map((face) => ({
        x: face.x,
        y: face.y,
        width: face.width,
        height: face.height,
        weight: 1.0,
      }));
      return resolve(boost);
    });
  });
});

const promiseGMBufferFirstFrame = (buffer, frame = 0) => new Promise((resolve, reject) => {
  gm(buffer).selectFrame(frame).toBuffer((err, buf) => {
    if (err) return reject(err);
    return resolve(buf);
  });
});

const promiseGM = (buffer, crop, width, height) => new Promise((resolve, reject) => {
  gm(buffer)
    .crop(width, height, crop.x, crop.y)
    // .resize(width, height, '!')
    .toBuffer((err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

const execute = async (url, width, height, userOptions) => {
  const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  console.log(buffer);
  if (!buffer) return undefined;

  const firstFrameBuffer = await promiseGMBufferFirstFrame(buffer);

  if (!firstFrameBuffer || !firstFrameBuffer.toString) return undefined;
  const reduceQualityBuffer = (firstFrameBuffer.toString().length > 30000) ? await sharp(firstFrameBuffer).jpeg({ quality: 10 }).toBuffer() : firstFrameBuffer;

  const options = await faceDetect(reduceQualityBuffer, userOptions).catch(() => null) || [{ width, height }];
  const { topCrop: crop } = await smartcrop.crop(buffer, options);
  return sharp(firstFrameBuffer)
    .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
    .resize(width, height)
    .toBuffer();
  // console.log(crop);
  // console.log(width, height);
  // return promiseGM(buffer, crop, width, height);
};


module.exports = execute;
