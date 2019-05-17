const { parentPort, isMainThread } = require('worker_threads');
const Jimp = require('jimp');
const ofp = require('../helpers/OverfriedHelper');

// check that the sorter was called as a worker thread
if (!isMainThread) {

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            //get image then get buffer after contrast
            let image = await ofp.overfriedProcess(message.image_url, 0.48);
            if(image) {
                image = image.contrast(0.87);
                buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
            }
        } catch(error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}