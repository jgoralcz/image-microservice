const { parentPort, isMainThread } = require("worker_threads");
const Jimp = require('jimp');

// check that the sorter was called as a worker thread
if (!isMainThread) {

    // load image beforehand.
    let image;
    let font;
    ( async () => {
        image = await Jimp.read('./assets/images/dog_template.png');
        font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    })();


    parentPort.on('message', async (message) => {

        let buffer;
        try {
            // const {text} = workerData;
            const template = await image.clone();

            buffer = await template.print(font, 350, 25, message.text, 280);
            buffer = await buffer.getBufferAsync(Jimp.MIME_JPEG);
        }
        catch (error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}