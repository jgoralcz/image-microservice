const { parentPort, isMainThread } = require('worker_threads');
const Jimp = require('jimp');
const gf = require('../helpers/GeneralizedFunctions.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {
    const x = 500;
    const y = 563;
    const rotate = 12;

    let image;
    (async () => {
        image = await Jimp.read('./assets/images/jojo_smile.png');
    })();

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            buffer = await gf.modifyImageOverImage(message.image_url, image, x, y, 360, 250, rotate, 63, 7, 0, 0, true);
        } catch(error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}