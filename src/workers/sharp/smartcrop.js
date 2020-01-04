const axios = require('axios');
const cv = require('opencv');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const smartcrop = require('smartcrop-gm');
const sharp = require('sharp');

const isGif = (buffer) => buffer.toString('hex', 0, 4) === '47494638';

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

const promiseGM = (buffer, crop, width, height, gif) => new Promise((resolve, reject) => {
  if (gif) {
    return im(buffer)
      .coalesce()
      .crop(crop.width * 2, crop.height * 2, crop.x, crop.y)
      // .gravity('Center')
      .resize(width * 2, height * 2)
      .resize(null, height)
      .crop(width, height, 0, 0)
      .trim()
      // .crop(width, height - 4, 0, 2)
      .background('#ffffff')
      .borderColor('white')
      .border(2, 2)
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  }
  return gm(buffer)
    .gravity('Center')
    .crop(crop.width * 2, crop.height * 2, crop.x, crop.y)
    .resize(width * 2, height * 2)
    .resize(null, height)
    .crop(width, height, 0)
    .crop(width + 92, height - 4, -50, 2)
    .background('#ffffff')
    .extent(221, 346)
    .borderColor('white')
    .border(2, 2)
    .flatten()
    .toBuffer('jpg', (err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

const execute = async (url, width, height, userOptions) => {
  let { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  const metadata = await sharp(buffer).metadata();

  if (metadata.width === 225 && metadata.height === 350) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .background('#ffffff')
        .extent(221, 346)
        .borderColor('white')
        .border(2, 2)
        .flatten()
        .toBuffer(isGif(buffer) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  // another weird ratio hard to get image sometimes.
  const ratio = metadata.width / metadata.height;
  if (ratio <= 0.56) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .coalesce()
        .resize(225, metadata.height * (225 / metadata.width), '!')
        .crop(221, 346, 0, 0)
        .background('#ffffff')
        .extent(221, 346)
        .borderColor('white')
        .border(2, 2)
        .flatten()
        .toBuffer(isGif(buffer) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }
  if (ratio <= 0.64) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .coalesce()
        .gravity('Center')
        .resize(225, metadata.height * (225 / metadata.width), '!')
        .crop(221, 346, 0, 0)
        .background('#ffffff')
        .extent(221, 346)
        .borderColor('white')
        .border(2, 2)
        .flatten()
        .toBuffer(isGif(buffer) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  const firstFrameBuffer = await promiseGMBufferFirstFrame(buffer);

  if (!firstFrameBuffer || !firstFrameBuffer.toString) return undefined;

  const reduceQualityBuffer = (firstFrameBuffer.toString().length > 10000) ? await sharp(firstFrameBuffer).jpeg({ quality: 20 }).toBuffer() : firstFrameBuffer;

  const options = await faceDetect(reduceQualityBuffer, userOptions).catch(() => []) || [];

  const { topCrop: crop } = await smartcrop.crop(buffer, options);

  if (isGif(buffer)) {
    return promiseGM(buffer, crop, width, height, true);
  }

  // ratio weird with gm
  if ((metadata.width / metadata.height) > 1) {
    const sharpBuffer = await sharp(buffer)
      .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
      .resize(width, height)
      .toBuffer();
    return new Promise((resolve, reject) => {
      gm(sharpBuffer)
        .background('#ffffff')
        .extent(221, 346)
        .borderColor('white')
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