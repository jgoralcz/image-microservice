// the main script to run most of your commands so the threads (actually processes for now)
const halloweenify = require('./jimp/Halloweenify.js');
const blurpify = require('./jimp/Blurpify.js');
const jpegify = require('./jimp/Jpegify.js');
const ascii = require('./jimp/Ascii.js');
const imgtobase64 = require('./jimp/IMGToBase64.js');
const giftobase64 = require('./jimp/GifToBase64.js');
const qrcodetext = require('./jimp/qrCode.js');
const pixelate = require('./jimp/Pixelate.js');

// canvas
const cmm = require('./canvas/ChangeMyMind.js');
const achievement = require('./canvas/Achievement.js');
const noteText = require('./canvas/NoteText.js');
const pengu = require('./canvas/Pengu.js');
const trumpLaw = require('./canvas/TrumpLaw.js');
const tweetPerson = require('./canvas/TweetPerson.js');
const whyFBIHere = require('./canvas/WhyFBIHere.js');
const sonicsays = require('./canvas/SonicSays.js');
const bazinga = require('./canvas/Bazinga.js');
const rdog = require('./canvas/Rdog.js');
const hatkidsays = require('./canvas/HatKidSays.js');
const fry = require('./canvas/Fried.js');
const deepfry = require('./canvas/DeepFry.js');
const overfry = require('./canvas/OverFry.js');
const billyYes = require('./canvas/BillyYes');
const yerin = require('./canvas/Yerin');
const water = require('./canvas/Water');
const graph = require('./canvas/Graph');

const homie = require('./jimp/Homie.js');

const canvasHelper = require('./WorkerHelpers/CanvasHelper.js');
const loadBuffer = require('./canvas/LoadBuffer.js');

// sharp
const sharpen = require('./sharp/Sharpen.js');
const blur = require('./sharp/Blur.js');

// check that the sorter was called as a worker thread
process.on('message', async (message) => {
  let buffer = {};
  try {
    const { endpoint } = message;
    const { body } = message;

    switch (endpoint) {
      case 'bodypillow':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 105, resizeY: 115, compositeX1: 220, compositeY1: 130,
        });
        break;

      case 'bodypillowmale':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 75, resizeY: 75, compositeX1: 95, compositeY1: 79,
        });
        break;

      case 'deepfry':
        buffer = await deepfry.execute(body.image_url, 0.26);
        buffer = await sharpen.execute(buffer, 100);
        break;

      case 'fry':
        buffer = await fry.execute(body.image_url, 0.12);
        buffer = await sharpen.execute(buffer, 100);
        break;

      case 'overfry':
        buffer = await overfry.execute(body.image_url, 0.23);
        buffer = await sharpen.execute(buffer, 100);
        break;

      case 'jojokira':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 315, resizeY: 430, compositeX1: 800, compositeY1: 10, rotate: 0.30,
        });
        break;

      case 'jojoshock':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 88, resizeY: 82, compositeX1: 302, compositeY1: 150,
        });
        break;

      case 'jojosmash':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 355, resizeY: 255, compositeX1: 0, compositeY1: 230,
        });
        break;

      case 'jojosmile':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 220, resizeY: 210, compositeX1: 173, compositeY1: 20, rotate: -0.3,
        });
        break;

      case 'jojowallet':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 445, resizeY: 270, compositeX1: 285, compositeY1: 125, rotate: -0.6,
        });
        break;

      case 'phonememe':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 350, resizeY: 600, compositeX1: 650, compositeY1: 580, rotate: 0.2,
        });
        break;

      case 'rdog':
        buffer = await rdog.execute(message.buffers, body.text);
        break;

      case 'water':
        buffer = await water.execute(message.buffers, body.text);
        break;

      case 'trumphold':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 250, resizeY: 370, compositeX1: 340, compositeY1: 190, rotate: 0.2,
        });
        break;

      case 'top10animebattles':
      case 'top10animesad':
      case 'top10animebrutal':
      case 'top10animebetrayal':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 625, resizeY: 391, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'policeposter':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 195, resizeY: 255, compositeX1: 190, compositeY1: 345, rotate: -0.17,
        });
        break;

      case 'payrespects':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 98, resizeY: 125, compositeX1: 70, compositeY1: -12, rotate: -0.09,
        });
        break;

      case 'mariojumping':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 270, resizeY: 200, compositeX1: 375, compositeY1: 0,
        });
        break;

      case 'sunnyframe':
      case 'sunnyframequote':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 275, resizeY: 475, compositeX1: 155, compositeY1: 25, rotate: -0.03,
        });
        break;

      case 'loveher':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 640, resizeY: 610, compositeX1: 0, compositeY1: 562,
        });
        break;

      case 'dio':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 934, resizeY: 720, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'dateline':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 480, resizeY: 480, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'nope':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 350, resizeY: 460, compositeX1: 310, compositeY1: 12,
        });
        break;

      case 'spongeboblook':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 400, resizeY: 400, compositeX1: 0, compositeY1: 215,
        });
        break;

      case 'hot':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 600, resizeY: 320, compositeX1: 0, compositeY1: 355,
        });
        break;

      case 'ihadto':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 480, resizeY: 480, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'vsauce':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 753, resizeY: 528, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'hatkidsays':
      case 'hatkidsayssmug':
        buffer = await hatkidsays.execute(message.buffers, body.text);
        break;

      case 'halloweenify':
        buffer = await halloweenify.execute(body.image_url, parseInt(body.threshold || 0, 10));
        break;

      case 'blurpify':
        buffer = await blurpify.execute(body.image_url);
        break;

      case 'sonicsays':
        buffer = await sonicsays.execute(message.buffers, body.text);
        break;

      case 'jpegify':
        buffer = await jpegify.execute(body.image_url);
        break;

      case 'homie':
        buffer = await homie.execute(message.buffers, body.image_url);
        break;

      case 'bazinga':
        buffer = await bazinga.execute(message.buffers, body.image_url);
        break;

      case 'blur':
        buffer = await loadBuffer.execute(body.image_url);
        buffer = await blur.execute(buffer, parseInt(body.number, 10) || 10);
        break;

      case 'sharpen':
        buffer = await loadBuffer.execute(body.image_url);
        buffer = await sharpen.execute(buffer, parseInt(body.number, 10) || 10);
        break;

      case 'ascii':
        buffer.data = await ascii.execute(body.image_url);
        break;

      case 'imgtobase64':
        buffer.data = await imgtobase64.execute(body.image_url);
        break;

      case 'giftobase64':
        buffer.data = await giftobase64.execute(body.image_url);
        break;

      case 'qrcode':
        buffer = await qrcodetext.execute(body.text);
        break;

      case 'pixelate':
        buffer = await pixelate.execute(body.image_url);
        break;

      case 'wtfpoe':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 480, resizeY: 340, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'bongocattop':
      case 'bongocatmiddle':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 680, resizeY: 689, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'pregnant':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 636, resizeY: 474, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'bobross':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 455, resizeY: 340, compositeX1: 5, compositeY1: 50, rotate: 0.05,
        });
        break;

      case 'bobrosszoom':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 247, resizeY: 228, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'changemymind':
        buffer = await cmm.execute(message.buffers, body.text);
        break;

      case 'yerin':
        buffer = await yerin.execute(message.buffers, body.text);
        break;

      case 'achievement':
        buffer = await achievement.execute(message.buffers, body.text);
        break;

      case 'noteimage':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 200, resizeY: 170, compositeX1: 425, compositeY1: 390, rotate: 0.4,
        });
        break;

      case 'notetext':
        buffer = await noteText.execute(message.buffers, body.text);
        break;

      case 'graph':
        buffer = await graph.execute(message.buffers, body.text1, body.text2);
        break;

      case 'pengu':
        buffer = await pengu.execute(message.buffers, body.text);
        break;

      case 'trumplaw':
        buffer = await trumpLaw.execute(message.buffers, body.text);
        break;

      case 'elontweet':
      case 'trumptweet':
        buffer = await tweetPerson.execute(message.buffers, body.text);
        break;

      case 'whyfbihere':
        buffer = await whyFBIHere.execute(message.buffers, body.text);
        break;

      case 'billyyes':
        buffer = await billyYes.execute(message.buffers, body.text);
        break;

      case 'wtfpikachu':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 535, resizeY: 370, compositeX1: 0, compositeY1: 0,
        });
        break;

      case 'simplerick':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 155, resizeY: 110, compositeX1: 225, compositeY1: 115, rotate: 0.13,
        });
        break;

      case '10haunting':
        buffer = await canvasHelper.execute(message.buffers, body.image_url, {
          resizeX: 500, resizeY: 290, compositeX1: 0, compositeY1: 0,
        });
        break;
      default:
        buffer = undefined;
    }
  } catch (error) {
    console.error(error);
  }

  // send back message buffer and request number
  process.send({ buffer, requestNum: message.requestNum });
});
