const { checkValidParams } = require('../ExpressServiceFactory.js');

module.exports = {

    /**
     * the module to add
     * @param module the module (this)
     * @param expressApp the express app
     * @param worker the worker
     */
    async initService(module, expressApp, worker) {

        // add the module nap to the express app
        expressApp.use(`/api/${module.name}`, async (req, res, next) => {

            // json body needed
            const body = req.body;

            // check if it's valid
            const valid = checkValidParams(res, body, module.args);
            if(!valid) return;

            // check the length
            if(body.text && module.maxChars && body.text.length > module.maxChars) {
                res.status(400);
                res.contentType('application/json');
                res.send(`{"error": "${module.name} has a max character limit of ${module.maxChars}"}`);
                return;
            }

            // first process the image
            const buffer = await worker.getCanvasBuffer(module.buffers, body.text);

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