const axios = require('axios');
const cv = require('opencv');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const smartcrop = require('smartcrop-gm');
const sharp = require('sharp');

const MAGIC = Object.freeze({
  jpgNumber: 'ffd8ffe0',
  jpg2Number: 'ffd8ffe1',
  pngNumber: '89504e47',
  gifNumber: '47494638',
  jpgGeneral: 'ffd8ff',
  webm: '1f45dfa3',
});

const isImageType = (buffer, type = MAGIC.gifNumber) => buffer.toString('hex', 0, 4) === type;

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
      .gravity('Center')
      .sharpen(1.5, 1)
      .crop(crop.width * 2, crop.height * 2, crop.x, crop.y)
      .resize(225 * 2, 350 * 2)
      .resize(null, 350)
      .borderColor('white')
      .extent(225, 350)
      .repage('+')
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  }
  return gm(buffer)
    .quality(92)
    .gravity('Center')
    .sharpen(1.5, 1)
    .crop(crop.width * 2, crop.height * 2, crop.x, crop.y)
    .resize(width * 2, height * 2)
    .resize(null, height)
    .crop(width, height, 0)
    .crop(width + 100, height, -50, 0)
    .background('#ffffff')
    // .extent(width, height)
    .flatten()
    .toBuffer('jpg', (err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

const execute = async (url, width, height, userOptions) => {
  let { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  if (isImageType(buffer, MAGIC.pngNumber)) {
    buffer = await new Promise((resolve, reject) => {
      gm(buffer).trim()
        .toBuffer('png', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  const metadata = await sharp(buffer).metadata();
  const roundedRatio = Math.floor((metadata.width / metadata.height) * 100) / 100;

  if ((roundedRatio === 0.63 || roundedRatio === 0.64 || roundedRatio === 0.65) && !isImageType(buffer, MAGIC.gifNumber)) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .background('#ffffff')
        .quality(92)
        .sharpen(1.5, 1)
        .resize(width, height)
        .crop(width, height, 0, 0)
        .gravity('Center')
        .extent(width, height)
        .flatten()
        .toBuffer(isImageType(buffer, MAGIC.gifNumber) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  // another weird ratio hard to get image sometimes.
  if (roundedRatio <= 0.56 && !isImageType(buffer, MAGIC.gifNumber)) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .quality(92)
        .sharpen(1.5, 1)
        .resize(width, metadata.height * (width / metadata.width), '!')
        .crop(width, height, 0, 0)
        .background('#ffffff')
        .extent(width, height)
        .flatten()
        .toBuffer(isImageType(buffer, MAGIC.gifNumber) ? 'gif' : 'jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }
  if (roundedRatio <= 0.64 && !isImageType(buffer, MAGIC.gifNumber)) {
    return new Promise((resolve, reject) => {
      gm(buffer)
        .quality(92)
        .sharpen(1.5, 1)
        .gravity('Center')
        .resize(width, metadata.height * (width / metadata.width), '!')
        .crop(width, height, 0, 0)
        .background('#ffffff')
        .extent(width, height)
        .flatten()
        .toBuffer(isImageType(buffer, MAGIC.gifNumber) ? 'gif' : 'jpg', (err, buf) => {
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

  if (isImageType(buffer, MAGIC.gifNumber)) {
    return promiseGM(buffer, crop, width, height, true);
  }

  if (roundedRatio > 1.7) {
    const sharpBuffer = await sharp(buffer)
      .extract({ width: crop.width, height: crop.height, left: crop.x, top: crop.y })
      .resize(width, height)
      .toBuffer();
    return new Promise((resolve, reject) => {
      gm(sharpBuffer)
        .quality(92)
        .sharpen(1.5, 1)
        .background('#ffffff')
        .extent(width, height)
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
