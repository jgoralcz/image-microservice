const axios = require('axios');
const cv = require('opencv');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const smartcrop = require('smartcrop-gm');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGiflossy = require('imagemin-giflossy');

const MAGIC = Object.freeze({
  jpgNumber: 'ffd8ffe0',
  jpg2Number: 'ffd8ffe1',
  pngNumber: '89504e47',
  gifNumber: '47494638',
  jpgGeneral: 'ffd8ff',
  webm: '1f45dfa3',
  webp: '52494646',
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

const promiseGMBufferFrame = (buffer, frame = 0) => new Promise((resolve, reject) => {
  gm(buffer).selectFrame(frame).toBuffer('jpg', (err, buf) => {
    if (err) return reject(err);
    return resolve(buf);
  });
});

const promiseGM = (buffer, crop, width, height, isGif, boost) => new Promise((resolve, reject) => {
  if (isGif) {
    return im(buffer)
      .coalesce()
      .sharpen(1.5, 1)
      .gravity('Center')
      .resize(width * 2, height * 2)
      .resize(null, height)
      .extent(width, height)
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  }

  return gm(buffer)
    .crop(crop.width, crop.height, crop.x, crop.y)
    .resize(width, height, '!')
    .quality(98)
    .toBuffer((err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

const getBoost = async (buffer, frameNum = 0, userOptions) => {
  const frameBuffer = await promiseGMBufferFrame(buffer, frameNum);
  if (!frameBuffer || !frameBuffer.toString) return undefined;

  const reduceQualityBuffer = (frameBuffer.toString().length > 10000)
    ? await new Promise((resolve, reject) => {
      gm(buffer)
        .quality(75)
        .toBuffer('jpg', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    })
    : frameBuffer;

  const boost = await faceDetect(reduceQualityBuffer, userOptions).catch(() => []) || [];
  return boost;
};

const execute = async (url, width, height, userOptions) => {
  let { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  const isGif = isImageType(buffer, MAGIC.gifNumber);

  let boost = await getBoost(buffer, 0, userOptions);
  if ((!boost || boost.length <= 0) && isGif) {
    boost = await getBoost(buffer, 1, userOptions);
  }

  if (isImageType(buffer, MAGIC.webp)) {
    buffer = await new Promise((resolve, reject) => {
      gm(buffer)
        .quality(98)
        .toBuffer('png', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  const { topCrop: crop } = await smartcrop.crop(buffer, { width, height, boost });
  const imageBuffer = isGif
    ? await promiseGM(buffer, crop, width, height, true, boost)
    : await promiseGM(buffer, crop, width, height, false, boost);

  return imagemin.buffer(imageBuffer, {
    plugins: [
      imageminMozjpeg({
        progressive: false,
        quality: 86,
      }),
      imageminPngquant({
        quality: [0.75, 0.85],
      }),
      imageminGiflossy({
        lossy: 35,
        optimizationLevel: 3,
      }),
    ],
  });
};

module.exports = execute;
