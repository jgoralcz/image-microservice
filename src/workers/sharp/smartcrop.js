const axios = require('axios');
const cv = require('opencv');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const smartcrop = require('smartcrop-gm');

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

const promiseGM = (buffer, crop, width, height, gif, boost) => new Promise((resolve, reject) => {
  if (gif) {
    const bufferIM = im(buffer)
      .coalesce()
      .gravity('Center');

    // if (boost && boost.length <= 0 && crop && crop.score && crop.score.saturation < 10 && (crop.score.detail < 5 || crop.score.saturation < -2 || crop.score.skin < 0)) {
    //   bufferIM.crop(width, height, 0, 0);
    // } else {
    //   bufferIM.crop(crop.width * 2, crop.height * 2, crop.x, crop.y);
    // }

    bufferIM.resize(225 * 2, 350 * 2)
      .resize(null, 350)
      .extent(225, 350)
      .repage('+')
      .toBuffer((err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
    return bufferIM;
  }

  const bufferGM = gm(buffer);
  // if (boost && boost.length <= 0 && crop && crop.score && crop.score.skin < 8 && crop.score.detail < 5 && (crop.score.saturation < -2 || crop.score.skin < -1 || crop.score.detail < -24)) {
  //   bufferGM.gravity('Center');
  // }
  bufferGM.crop(crop.width, crop.height, crop.x, crop.y)
    .resize(width, height, '!')
    .flatten()
    .background('#ffffff')
    .quality(95)
    .toBuffer('jpg', (err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });

  return bufferGM;
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

  if (isImageType(buffer, MAGIC.pngNumber)) {
    buffer = await new Promise((resolve, reject) => {
      im(buffer)
        .flatten()
        .fuzz(1, true)
        .trim()
        .repage('+')
        .toBuffer((err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  let boost = await getBoost(buffer, 0, userOptions);
  if ((!boost || boost.length <= 0) && isImageType(buffer, MAGIC.gifNumber)) {
    boost = await getBoost(buffer, 1, userOptions);
  }

  const { topCrop: crop } = await smartcrop.crop(buffer, { width, height, boost });
  if (isImageType(buffer, MAGIC.gifNumber)) {
    return promiseGM(buffer, crop, width, height, true, boost);
  }
  return promiseGM(buffer, crop, width, height, false, boost);
};

module.exports = execute;
