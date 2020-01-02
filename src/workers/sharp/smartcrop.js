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
  const imageType = buffer.toString('hex', 0, 4);

  // magic numbers for gif detection
  if (imageType === '47494638') {
    return gm(buffer)
      .quality(60)
      .crop(crop.width * 1.6, crop.height * 1.6, crop.x, crop.y)
      .gravity('Center')
      .resize(width * 2, height * 2)
      .resize(null, height)
      // .extent(width, height)
      .crop(width, height, 0)
      .crop(width + 92, height - 4, -50, 2)
      .borderColor('white')
      .border(2, 2)
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  }
  return gm(buffer)
    .quality(80)
    .gravity('Center')
    .crop(crop.width * 1.3, crop.height * 1.3, crop.x, crop.y)
    .resize(width * 2, height * 2)
    .resize(null, height)
    .crop(width, height, 0)
    .crop(width + 92, height - 4, -50, 2)
    .borderColor('white')
    .border(2, 2)
    .flatten()
    .toBuffer('jpg', (err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

const execute = async (url, width, height, userOptions) => {
  const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  const firstFrameBuffer = await promiseGMBufferFirstFrame(buffer);

  if (!firstFrameBuffer || !firstFrameBuffer.toString) return undefined;

  const reduceQualityBuffer = (firstFrameBuffer.toString().length > 10000) ? await sharp(firstFrameBuffer).jpeg({ quality: 20 }).toBuffer() : firstFrameBuffer;


  const options = await faceDetect(reduceQualityBuffer, userOptions).catch(() => []) || [];

  const { topCrop: crop } = await smartcrop.crop(buffer, options);
  const metadata = await sharp(buffer).metadata();

  if (metadata.width % 225 === 0 && metadata.height % 350 === 0) {
    return new Promise((resolve, reject) => {
      gm(buffer).borderColor('white')
        .resize(225, 350)
        .border(2, 2)
        .flatten()
        .toBuffer('jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  // ratio weird with gm
  if ((metadata.width / metadata.height) > 1) {
    const sharpBuffer = await sharp(buffer)
      .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
      .resize(width, height)
      .jpeg({ quality: 100, progressive: true })
      .toBuffer();
    return new Promise((resolve, reject) => {
      gm(sharpBuffer).borderColor('white')
        .border(2, 2)
        .flatten()
        .toBuffer('jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  return promiseGM(buffer, crop, width, height);
};


module.exports = execute;
