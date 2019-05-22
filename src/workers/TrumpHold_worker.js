const { parentPort, isMainThread } = require('worker_threads');
const Jimp = require('jimp');
const gf = require('../helpers/GeneralizedFunctions.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {
    const x = 807;
    const y = 591;

    let image;
    (async () => {
        image = await Jimp.read('./assets/images/trumphold.png');
    })();

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            buffer = await gf.modifyImageOverImage(message.image_url, image, x, y, 228, 370, -7.75, 312, 190, 0, 0);
        } catch(error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}