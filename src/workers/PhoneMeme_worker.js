const { parentPort, isMainThread } = require('worker_threads');
const Jimp = require('jimp');
const gf = require('../helpers/GeneralizedFunctions.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {
    const x = 1021;
    const y = 1200;
    const rotate = -14;

    let image;
    (async () => {
        image = await Jimp.read('./assets/images/phone_meme.png');
    })();

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            buffer = await gf.modifyImageOverImage(message.image_url, image, x, y, 400, 600, rotate, 500, 600, 0, 0);
        } catch(error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}