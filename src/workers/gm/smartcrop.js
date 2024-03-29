const axios = require('axios');
const sharp = require('sharp');
const cv = require('opencv');
const gifResize = require('@gumlet/gif-resize');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const imagemin = require('imagemin');
const imageminGifquant = require('imagemin-giflossy');
const smartcrop = require('smartcrop-gm');
const sizeOf = require('image-size');
const Jimp = require('jimp');

// for extensive testing: docker rm -f mims-v2 || true && docker run -v /Users/Josh/Documents/GitHub/image-microservice//src/workers/gm:/usr/node/src/workers/gm -d -p 8444:8443 --name mims-v2 mims-v2

/*
  example body: {
    "image_url": "https://media.discordapp.net/attachments/762010982536314891/766403625773563918/image0.png",
    "width": 315,
    "height": 490,
    "minBufferSize": 40000,
    "options": {
        "animeFace": true,
        "border": {
            "x": 1.4,
            "y": 1.4,
            "color": "white"
        },
        "sharpen": {
            "minX": 225,
            "minY": 350,
            "minBufferSize": 25000,
            "maxX": 225,
            "maxY": 350,
            "maxBufferSize": 40000
        }
    }
  }
*/

const MAGIC = Object.freeze({
  jpgNumber: 'ffd8ffe0',
  jpg2Number: 'ffd8ffe1',
  pngNumber: '89504e47',
  gifNumber: '47494638',
  jpgGeneral: 'ffd8ff',
  webm: '1f45dfa3',
  webp: '52494646',
  JIMP_WHITE_NUMBER: 4294967295,
});

const ANIME_FACE_CASCADE = '/usr/node/assets/opencv/lbpcascade_animeface.xml';

const isImageType = (buffer, type = MAGIC.gifNumber) => buffer.toString('hex', 0, 4) === type;

const faceDetect = (input, userOptions) => new Promise((resolve, reject) => {
  cv.readImage(input, (err, image) => {
    if (err) return reject(err);
    return image.detectObject(userOptions.face ? cv.FACE_CASCADE : ANIME_FACE_CASCADE, {}, (error, faces) => {
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

// eslint-disable-next-line max-len
const border = (buffer, borderXSize, borderYSize, color) => new Promise((resolve, reject) => im(buffer)
  .coalesce()
  .border(borderXSize, borderYSize)
  .borderColor(color)
  .toBuffer((err, buf) => {
    if (err) return reject(err);
    return resolve(buf);
  }));

const checkTransparency = async (buffer) => {
  // resize so we don't need to process anything extra
  const thumbnailBuffer = await new Promise((resolve, reject) => {
    gm(buffer).resize(25, 25, '!').toBuffer((err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
  });

  // use jimp because it is easier to read and check for a transparent pixel
  const image = await Jimp.read(thumbnailBuffer);

  return new Promise((resolve) => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      if (image.bitmap.data[idx + 3] === 0) {
        return resolve(true);
      }
      if (x === image.bitmap.width - 1 && y === image.bitmap.height - 1) {
        return resolve(false);
      }
    });
  });
};

const promiseGM = (buffer, crop, width, height, isGif, hasBorder, borderResizeX, borderResizeY, foundRatio) => new Promise(async (resolve) => {
  const borderX = hasBorder && isGif ? 0 : Math.ceil(borderResizeX) * 2;
  const borderY = hasBorder && isGif ? 0 : Math.ceil(borderResizeY) * 2;

  if (isGif) {
    if (crop) {
      // TODO: fix this gif problem
      return resolve(gifResize({ width: 225 - borderX, height: 350 - borderY, crop: [crop.x, crop.y, crop.width, crop.height] })(buffer));
    }
    return resolve(buffer);
  }

  let gmBuff = gm(buffer);

  let buff;
  if (gmBuff && crop) {
    gmBuff.crop(crop.width, crop.height, crop.x, crop.y);
    buff = await new Promise((r, rj) => {
      gmBuff.toBuffer('PNG', (err, buf) => {
        if (err) return rj(err);
        return r(buf);
      });
    });
  } else {
    buff = buffer;
  }

  buff = await sharp(buff)
    .resize(width, height, { fit: 'fill' })
    .png()
    .toBuffer();

  if (foundRatio) {
    buff = await new Promise((r, rj) => {
      gm(buff).crop(width - 3, height - 3, 3, 3).toBuffer('PNG', (err, buf) => {
        if (err) return rj(err);
        return r(buf);
      });
    });

    buff = await sharp(buff)
      .resize(width, height, { fit: 'fill' })
      .png()
      .toBuffer();
  }

  if (borderX || borderY) {
    gmBuff = gm(buff);
    gmBuff.crop(width - borderX, height - borderY, borderResizeX, borderResizeY);
    buff = await new Promise((r, rj) => {
      gmBuff.toBuffer('PNG', (err, buf) => {
        if (err) return rj(err);
        return r(buf);
      });
    });
  }

  buff = await sharp(buff)
    .resize(width - borderX, height - borderY, { fit: 'fill' })
    .png()
    .toBuffer();

  return resolve(buff);
});

const buffToWebP = async (buffer) => {
  const buffer1 = await sharp(buffer).webp({
    quality: 94,
    // nearLossless: true,
    reductionEffort: 6,
    force: true,
  }).toBuffer();

  if (buffer1.length > 50000) {
    return buffer1;
  }

  return sharp(buffer).webp({
    quality: 96,
    // nearLossless: true,
    reductionEffort: 6,
    force: true,
  }).toBuffer();
};

const getBoost = async (buffer, frameNum = 0, userOptions) => {
  if (!userOptions.face && !userOptions.animeFace) return [];

  const frameBuffer = await promiseGMBufferFrame(buffer, frameNum);
  if (!frameBuffer || !frameBuffer.toString) return [];

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

  return faceDetect(reduceQualityBuffer, userOptions).catch(() => []) || [];
};

const execute = async (url, width, height, passedBuffer, userOptions) => {
  let buffer;
  if (passedBuffer) {
    buffer = passedBuffer;
  } else {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    if (data) buffer = data;
  }
  if (!buffer) return undefined;

  const isWebP = isImageType(buffer, MAGIC.webp);
  if (isWebP) {
    buffer = await sharp(buffer).png().toBuffer();
  }

  const isGif = isImageType(buffer, MAGIC.gifNumber);

  const tempBuffer = isGif ? await promiseGMBufferFrame(buffer, 0) : buffer;

  // already wanted width, height... no need to do any special processing...
  const { width: bufferWidth, height: bufferHeight } = await sizeOf(tempBuffer);

  const isTransparent = await checkTransparency(tempBuffer);
  const imageAlreadyHasBorder = isTransparent || !userOptions.border;
  if (!userOptions.border) {
    userOptions.border = {};
  }

  if (userOptions && userOptions.border && userOptions.border.x == null) {
    userOptions.border.x = isGif ? 1 : 2;
  }

  if (userOptions && userOptions.border && userOptions.border.y == null) {
    userOptions.border.y = isGif ? 1 : 2;
  }

  if (userOptions && userOptions.border && !userOptions.border.color) {
    userOptions.border.color = 'white';
  }

  const { border: userBorder } = userOptions;

  let boost = await getBoost(buffer, 0, userOptions);
  if ((!boost || boost.length <= 0) && isGif) {
    boost = await getBoost(buffer, 1, userOptions);
  }

  const bufferRatio = (bufferWidth / bufferHeight).toFixed(2);
  const wantedRatio = (width / height).toFixed(2);

  const { topCrop: crop } = bufferRatio === wantedRatio ? { topCrop: undefined } : await smartcrop.crop(buffer, { width, height, boost });
  const processedBuffer = await promiseGM(buffer, crop, width, height, isGif, isTransparent, userBorder.x, userBorder.y, bufferRatio === wantedRatio);

  if (isGif) {
    if (!imageAlreadyHasBorder) {
      const bufferBorder = await border(processedBuffer, userBorder.x, userBorder.y, userBorder.color);
      const finalBuffer = await promiseGM(bufferBorder, undefined, width, height, true, true, userBorder.x, userBorder.y, bufferRatio === wantedRatio);

      return imagemin.buffer(finalBuffer, {
        plugins: [
          imageminGifquant({
            optimizationLevel: 3,
            lossy: 40,
          }),
        ],
      });
    }

    const finalBuffer = processedBuffer;
    return imagemin.buffer(finalBuffer, {
      plugins: [
        imageminGifquant({
          optimizationLevel: 3,
          lossy: 40,
        }),
      ],
    });
  }

  const imageBuffer = isTransparent ? processedBuffer : await border(processedBuffer, userBorder.x, userBorder.y, userBorder.color);

  return buffToWebP(imageBuffer);
};

module.exports = execute;
