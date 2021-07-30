const axios = require('axios');
const sharp = require('sharp');
const cv = require('opencv');
const gifResize = require('@gumlet/gif-resize');
const im = require('gm').subClass({ imageMagick: true });
const gm = require('gm');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
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

const targetColor = {
  r: 255,
  g: 255,
  b: 255,
};

const colorDistance = (c1, c2) => ((c1.r - c2.r) + (c1.g - c2.g) + (c1.b - c2.b)) / 3;

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

const border = (buffer, borderXSize, borderYSize, color) => new Promise(
  (resolve, reject) => im(buffer)
    .coalesce()
    .border(borderXSize, borderYSize)
    .borderColor(color)
    .toBuffer((err, buf) => {
      if (err) return reject(err);
      return resolve(buf);
    }),
);

const checkBorder = async (buffer) => {
  const image = await Jimp.read(buffer);

  const { width, height } = image.bitmap;
  if (width < 10 || height < 10) return false;

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const thisColor = {
      r: image.bitmap.data[idx],
      g: image.bitmap.data[idx + 1],
      b: image.bitmap.data[idx + 2],
    };
    const colorD = colorDistance(targetColor, thisColor);
    if (colorD <= 32) {
      image.bitmap.data[idx] = 255;
      image.bitmap.data[idx + 1] = 255;
      image.bitmap.data[idx + 2] = 255;
      image.bitmap.data[idx + 3] = 255;
    }
  });

  const realWidth = width - 1;
  const realHeight = height - 1;

  for (let i = 0; i < 10; i += 1) {
    const topLeftCorner = image.getPixelColor(i, i);
    const topRightCorner = image.getPixelColor(realWidth - i, i);
    const bottomLeftCorner = image.getPixelColor(i, realHeight - i);
    const bottomRightCorner = image.getPixelColor(realWidth - i, realHeight - i);

    if ((topLeftCorner === topRightCorner && topLeftCorner === bottomLeftCorner)
      || (topLeftCorner === topRightCorner && topLeftCorner === bottomRightCorner)) {
      return true;
    }

    if (topLeftCorner === topRightCorner && bottomLeftCorner === bottomRightCorner) {
      return true;
    }
  }

  return false;
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

const promiseGM = (buffer, crop, width, height, isGif, hasBorder, borderResizeX, borderResizeY) => new Promise(async (resolve) => {
  const borderX = hasBorder ? 0 : Math.ceil(borderResizeX) * 2;
  const borderY = hasBorder ? 0 : Math.ceil(borderResizeY) * 2;

  if (isGif) {
    if (crop) {
      return resolve(gifResize({ width: 225 - borderX, height: 350 - borderY, stretch: true, crop: [crop.x, crop.y, crop.width, crop.height] })(buffer));
    }
    return resolve(gifResize({ width: 225 - borderX, height: 350 - borderY, stretch: true })(buffer));
  }

  const gmBuff = gm(buffer);

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

  return resolve(sharp(buff)
    .resize(width - borderX, height - borderY, { fit: 'fill' })
    .png()
    .toBuffer());
});

const buffToWebP = async (buffer) => sharp(buffer).webp({
  quality: 94,
  // nearLossless: true,
  reductionEffort: 6,
  force: true,
}).toBuffer();

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
  const hasBorder = await checkBorder(tempBuffer, width, height);
  const { border: userBorder } = userOptions;

  if (userOptions.border.x == null) {
    userOptions.border.x = 2;
  }

  if (userOptions.border.y == null) {
    userOptions.border.y = 2;
  }

  const isTransparent = await checkTransparency(tempBuffer);
  const imageAlreadyHasBorder = hasBorder || isTransparent || !userBorder;

  let boost = await getBoost(buffer, 0, userOptions);
  if ((!boost || boost.length <= 0) && isGif) {
    boost = await getBoost(buffer, 1, userOptions);
  }

  const bufferRatio = (bufferWidth / bufferHeight).toFixed(2);
  const wantedRatio = (width / height).toFixed(2);

  const { topCrop: crop } = bufferRatio === wantedRatio ? { topCrop: undefined } : await smartcrop.crop(buffer, { width, height, boost });
  const processedBuffer = await promiseGM(buffer, crop, width, height, isGif, imageAlreadyHasBorder, userBorder.x, userBorder.y);

  if (isGif && !imageAlreadyHasBorder) {
    const bufferBorder = await border(processedBuffer, userBorder.x, userBorder.y, userBorder.color);
    return promiseGM(bufferBorder, undefined, width, height, true, true, userBorder.x, userBorder.y);
  }

  const imageBuffer = imageAlreadyHasBorder
    ? processedBuffer
    : await border(processedBuffer, userBorder.x, userBorder.y, userBorder.color);

  const webP = await buffToWebP(imageBuffer);

  return imagemin.buffer(webP, {
    plugins: [
      imageminMozjpeg({
        progressive: false,
        quality: 85,
      }),
      imageminPngquant({
        quality: [0.90, 1.00],
        speed: 1,
      }),
    ],
  });
};

module.exports = execute;
