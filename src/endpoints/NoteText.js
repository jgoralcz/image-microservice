const { checkValidParams } = require('../ExpressServiceFactory.js');
const worker = require('../workers/canvas/NoteText_worker.js');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

module.exports =  {
    name: 'notetext',
    file: './assets/images/noteText.jpg',
    args: ['text'],

    /**
     * the module to add
     * @param module the module (this)
     * @param expressApp the express app
     */
    async initService(module, expressApp) {
        const image = await readFileAsync(this.file);

        // add the module nap to the express app
        expressApp.use(`/api/${module.name}`, async (req, res, next) => {

            // json body needed
            const body = req.body;

            // check if it's valid
            const valid = checkValidParams(res, body, this.args);
            if(!valid) return;

            // first process the image
            const buffer = await worker.getCanvasBuffer(image, body.text);

            // make sure we have an uint8array
            if (buffer instanceof Uint8Array) {
                res.status(200);
                res.contentType('image/jpg');
                res.send(buffer);
            }
            else {
                res.status(500);
                res.contentType('application/json');
                res.send('{"error": "server error, image has errors."}');
            }
        });
    }
};
