const { parentPort, isMainThread } = require('worker_threads');
const Jimp = require('jimp');
const gf = require('../helpers/GeneralizedFunctions.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {

    let image;
    (async () => {
        image = await Jimp.read('./assets/images/bodypillow.png');
    })();

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            buffer = await gf.modifyImageOverImage(message.image_url, image, 105, 115, 0, 220, 130, 0, 0);
        } catch(error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}