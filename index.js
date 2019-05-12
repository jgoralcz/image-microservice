const express = require('express');
const app = express();
const Jimp = require('jimp');
app.use(express.json());

const { Worker, isMainThread, parentPort} = require('worker_threads');
if (isMainThread) {
    // This code is executed in the main thread and not in the worker.

    app.use('/', async (req, res, next) => {
        console.log(req.body);
        // Create the worker.
        const worker = new Worker(__filename);

        // Listen for messages from the worker and print them.
        worker.once('message', (buffer) => {
            res.contentType('image/jpg');
            res.send(buffer);
        });
        worker.on('error', (error) => console.error(error));

        worker.on('exit', (code) => {
            console.log(code);
        });
        worker.postMessage(req.body.url);

    });
    app.listen(9002);

}
else {

    parentPort.once('message', async (message) => {

        let buffer;
        try {
            const date = Date.now();
            const jimpImage = await Jimp.read(message);
            buffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);
            console.log('buffer image', (Date.now() - date) );
        }
        catch(error) {
            console.error(error);
        }
        // Send a message to the main thread.

        parentPort.postMessage(buffer);
    });
}