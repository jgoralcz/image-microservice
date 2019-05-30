const sharp = require('sharp');

module.exports =  {
    name: 'deepfry',
    args: ['image_url'],

    /**
     * the worker message listener for this endpoint.
     * @param req the request object.
     * @param res the response object.
     * @param worker the worker thread.
     * @returns {*}
     */
    workerMessageListener: function(req, res, worker) {
        return worker.once('message', async (buffer) => {

            // make sure we have an uint8array
            if (buffer instanceof Uint8Array) {
                buffer = Buffer.from(buffer);

                // use sharpen, doesn't block thread apparently
                buffer = await sharp(buffer).sharpen(100).toBuffer();
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
    },
};