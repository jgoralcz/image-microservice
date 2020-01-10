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

const promiseGM = (buffer, crop, width, height, multiplier, gif) => new Promise((resolve, reject) => {
  if (gif) {
    return im(buffer)
      .coalesce()
      .gravity('Center')
      .sharpen(2, 1)
      .crop(crop.width * 2, crop.height * 2, crop.x, crop.y)
      .resize(225 * 2, 350 * 2)
      .resize(null, 350)
      .borderColor('white')
      .extent(225 - 4, 350 - 4)
      .border(2, 2)
      .repage('+')
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  }
  return gm(buffer)
    .quality(92)
    .gravity('Center')
    .sharpen(2, 1)
    .crop(crop.width * 2, crop.height * 2, crop.x, crop.y)
    .resize(width * 2, height * 2)
    .resize(null, height)
    .crop(width, height, 0)
    .crop(width + 92, height - 4 * multiplier, -50, 2 * multiplier)
    .background('#ffffff')
    .extent(width - 4 * multiplier, height - 4 * multiplier)
    .borderColor('white')
    .border(2 * multiplier, 2 * multiplier)
    .flatten()
    .toBuffer('jpg', (err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

const execute = async (url, width, height, userOptions) => {
  const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  const metadata = await sharp(buffer).metadata();
  const roundedRatio = Math.floor((metadata.width / metadata.height) * 100) / 100;

  // const multiplier = (width > 225 && height > 350) ? 1 : 0.5;
  const multiplier = 0.5;

  if ((roundedRatio === 0.63 || roundedRatio === 0.64 || roundedRatio === 0.65) && !isGif(buffer)) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .background('#ffffff')
        .quality(92)
        .sharpen(2, 1)
        .resize(width, height)
        .crop(width, height, 0, 0)
        .gravity('Center')
        .extent(width - 4 * multiplier, height - 4 * multiplier)
        .borderColor('white')
        .border(2 * multiplier, 2 * multiplier)
        .flatten()
        .toBuffer(isGif(buffer) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  // another weird ratio hard to get image sometimes.
  if (roundedRatio <= 0.56 && !isGif(buffer)) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .quality(92)
        .sharpen(2, 1)
        .resize(width, metadata.height * (width / metadata.width), '!')
        .crop(width - 4 * multiplier, height - 4 * multiplier, 0, 0)
        .background('#ffffff')
        .extent(width - 4 * multiplier, height - 4 * multiplier)
        .borderColor('white')
        .border(2 * multiplier, 2 * multiplier)
        .flatten()
        .toBuffer(isGif(buffer) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }
  if (roundedRatio <= 0.64) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .quality(92)
        .sharpen(2, 1)
        .gravity('Center')
        .resize(width, metadata.height * (width / metadata.width), '!')
        .crop(width - 4 * multiplier, height - 4 * multiplier, 0, 0)
        .background('#ffffff')
        .extent(width - 4 * multiplier, height - 4 * multiplier)
        .borderColor('white')
        .border(2 * multiplier, 2 * multiplier)
        .flatten()
        .toBuffer(isGif(buffer) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  const firstFrameBuffer = await promiseGMBufferFirstFrame(buffer);

  if (!firstFrameBuffer || !firstFrameBuffer.toString) return undefined;

  const reduceQualityBuffer = (firstFrameBuffer.toString().length > 10000) ? await sharp(firstFrameBuffer).jpeg({ quality: 40 }).toBuffer() : firstFrameBuffer;

  const options = await faceDetect(reduceQualityBuffer, userOptions).catch(() => []) || [];

  const { topCrop: crop } = await smartcrop.crop(buffer, options);

  if (isGif(buffer)) {
    return promiseGM(buffer, crop, width, height, multiplier, true);
  }

  if (roundedRatio > 1.7) {
    const sharpBuffer = await sharp(buffer)
      .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
      .resize(width, height)
      .toBuffer();
    return new Promise((resolve, reject) => {
      gm(sharpBuffer)
        .quality(92)
        .sharpen(2, 1)
        .background('#ffffff')
        .extent(width - 4 * multiplier, height - 4 * multiplier)
        .borderColor('white')
        .border(2 * multiplier, 2 * multiplier)
        .flatten()
        .toBuffer('jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  return promiseGM(buffer, crop, width, height, multiplier);
};


module.exports = execute;
