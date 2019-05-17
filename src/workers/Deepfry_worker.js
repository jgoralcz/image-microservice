const { parentPort, isMainThread } = require("worker_threads");
const Jimp = require('jimp');
const sharp = require('sharp');
const ofp = require('../helpers/OverfriedHelper');

// check that the sorter was called as a worker thread
if (!isMainThread) {


    parentPort.on('message', async (message) => {

        let buffer;
        try {
            //get image then get buffer after contrast
            let image = await ofp.overfriedProcess(message.image_url, 0.43);
            if(image) {
                image = image.contrast(0.65).brightness(0.1);
                buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
                buffer = await sharp(buffer).sharpen(100).toBuffer();
            }
            else {
            }
        } catch(error) {
            console.error(error);
        }
        console.log(buffer);
        parentPort.postMessage(buffer);
    });
}