const { parentPort, isMainThread } = require('worker_threads');
const Jimp = require('jimp');
const gf = require('../helpers/GeneralizedFunctions.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {
    const x = 621;
    const y = 721;

    let image;
    (async () => {
        image = await Jimp.read('./assets/images/bobross_template.png');
    })();

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            buffer = await gf.modifyImageOverImage(message.image_url, image, x, y, 455, 400, -2, 5, 36, 0, 0);
        } catch(error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}