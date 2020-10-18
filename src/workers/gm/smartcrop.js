const axios = require('axios');
const cv = require('opencv');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const smartcrop = require('smartcrop-gm');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGiflossy = require('imagemin-giflossy');
const sizeOf = require('image-size');
const Jimp = require('jimp');

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

const border = (buffer, borderXSize, borderYSize, color, wantedWidth, wantedHeight) => new Promise((resolve, reject) => gm(buffer)
  .border(borderXSize, borderYSize)
  .borderColor(color)
  .resize(wantedWidth, wantedHeight, '!')
  .toBuffer((err, buf) => {
    if (err) return reject(err);
    return resolve(buf);
  }));

const checkBorder = async (buffer) => {
  // use jimp because it is easier to read and check for a transparent pixel
  const image = await Jimp.read(buffer);

  const { width, height } = image.bitmap;

  const midTop = await image.getPixelColor(width / 2, 1);
  const veryMidTop = await image.getPixelColor(width / 2, 0);

  const midBottom = await image.getPixelColor(width / 2, height - 2);
  const veryMidBottom = await image.getPixelColor(width / 2, height - 1);

  const midLeft = await image.getPixelColor(1, height / 2);
  const veryMidLeft = await image.getPixelColor(0, height / 2);

  const midRight = await image.getPixelColor(width - 2, height / 2);
  const veryMidRight = await image.getPixelColor(width, height / 2);

  return (midTop === midBottom && midLeft === midRight) || (veryMidTop === veryMidBottom || veryMidLeft === veryMidRight);
};

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

const promiseGM = (buffer, crop, width, height, isGif, bufferWidth, bufferHeight, sharpenOptions) => new Promise((resolve, reject) => {
  if (isGif) {
    const imBuff = im(buffer)
      .coalesce();
    // some images with very low quality need more colors or sharpened.
    if (sharpenOptions && ((bufferWidth <= sharpenOptions.minX && bufferHeight <= sharpenOptions.minY && buffer.length < sharpenOptions.minBufferSize)
      || (bufferWidth <= sharpenOptions.maxX && bufferHeight <= sharpenOptions.maxY
        && bufferWidth > sharpenOptions.minX && bufferHeight > sharpenOptions.minY && buffer.length < sharpenOptions.maxBufferSize))) {
      imBuff.sharpen(2, 1);
    }

    if (imBuff && crop) {
      imBuff.crop(crop.width, crop.height, crop.x, crop.y);
    }

    imBuff.resize(width, height, '!')
      .toBuffer('gif', (err, buf) => {
        if (err) return reject(err);
        return resolve(buf);
      });
  }

  const gmBuff = gm(buffer);
  // some images with very low quality need more colors or sharpened.
  if (sharpenOptions && ((bufferWidth <= sharpenOptions.minX && bufferHeight <= sharpenOptions.minY && buffer.length < sharpenOptions.minBufferSize)
    || (bufferWidth <= sharpenOptions.maxX && bufferHeight <= sharpenOptions.maxY
      && bufferWidth > sharpenOptions.minX && bufferHeight > sharpenOptions.minY && buffer.length < sharpenOptions.maxBufferSize))) {
    gmBuff.sharpen(2, 1);
  }

  if (gmBuff && crop) {
    gmBuff.crop(crop.width, crop.height, crop.x, crop.y);
  }

  gmBuff.resize(width, height, '!')
    .toBuffer('png', (err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    });
});

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

const execute = async (url, width, height, userOptions) => {
  let { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });
  if (!buffer) return undefined;

  const isWebP = isImageType(buffer, MAGIC.webp);

  // already wanted width, height... no need to do any special processing...
  const { width: bufferWidth, height: bufferHeight } = await sizeOf(buffer);
  const hasBorder = isWebP ? false : await checkBorder(buffer);
  const { border: userBorder } = userOptions;

  const isTransparent = isWebP ? true : await checkTransparency(buffer);

  if (width === bufferWidth && height === bufferHeight && buffer.length > (userOptions.minBuffer || 25000)) {
    return hasBorder || isTransparent || !userBorder
      ? buffer
      : border(buffer, userBorder.x, userBorder.y, userBorder.color, width, height);
  }

  if (isWebP) {
    buffer = await new Promise((resolve, reject) => {
      gm(buffer)
        .toBuffer('png', (err, buf) => {
          if (err) return reject(err);
          return resolve(buf);
        });
    });
  }

  const isGif = isImageType(buffer, MAGIC.gifNumber);
  let boost = await getBoost(buffer, 0, userOptions);
  if ((!boost || boost.length <= 0) && isGif) {
    boost = await getBoost(buffer, 1, userOptions);
  }

  const bufferRatio = (bufferWidth / bufferHeight).toFixed(2);
  const wantedRatio = (width / height).toFixed(2);

  const { topCrop: crop } = bufferRatio === wantedRatio ? { topCrop: undefined } : await smartcrop.crop(buffer, { width, height, boost });
  const processedBuffer = isGif
    ? await promiseGM(buffer, crop, width, height, true, bufferWidth, bufferHeight)
    : await promiseGM(buffer, crop, width, height, false, bufferWidth, bufferHeight);

  // add their border if they requested one and image is not transparent
  const imageBuffer = hasBorder || isTransparent || !userBorder
    ? processedBuffer
    : await border(processedBuffer, userBorder.x, userBorder.y, userBorder.color, width, height);

  return imagemin.buffer(imageBuffer, {
    plugins: [
      imageminMozjpeg({
        progressive: false,
        quality: 98,
      }),
      imageminPngquant({
        quality: [0.96, 1.00],
        speed: 1,
      }),
      imageminGiflossy({ unoptimize: true, 'keep-empty': true }),
    ],
  });
};

module.exports = execute;
