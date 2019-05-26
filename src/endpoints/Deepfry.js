const sharp = require('sharp');
const { Worker } = require('worker_threads');

module.exports =  {
    counter: 0,
    maxThreads: 3,
    name: 'deepfry',
    workerScript:'./src/workers/Deepfry_worker.js',
    args: ['image_url'],

    /**
     * the module to add
     * @param module the module (this)
     * @param expressApp the express app
     */
    initService(module, expressApp) {
        // create new worker threads based off their specification
        let workerArray = new Array(module.maxThreads);

        // persist the workers into its own array
        for(let i = 0; i < module.maxThreads; i++) {
            workerArray[i] = createWorker(module.workerScript);
        }

        // get the counter and max threads to loop through to "load balance" it out (kind of lazy way)
        let counter = 0;
        const maxThreads = module.maxThreads;

        // add the module nap to the express app
        expressApp.use(`/api/${module.name}`, (req, res, next) => {

            // json body needed
            const body = req.body;

            // check the body to make sure we have the right args
            for(let i = 0; i < module.args.length; i++) {
                let arg = module.args[i];

                // no body with this argument, bad input
                if(!body[arg]) {
                    res.status(400);
                    res.contentType('application/json');
                    res.send(`{"error": "Incorrect Parameters met. Needs: ${module.args}"}`);
                    return;
                }
            }

            // simple way of queueing the threads
            counter++;
            if(counter >= maxThreads) counter = 0;
            const worker = workerArray[counter];


            // recovery method, create a new worker
            if(worker == null) {
                // create a new worker.
                workerArray[counter] = createWorker(module.workerScript);

                // check if it's still null
                if(worker == null) {
                    res.status(500);
                    res.contentType('application/json');
                    res.send('{"error": "image has errors."}');
                    return;
                }
            }

            // listen for message back, which is hopefully a buffer image.
            worker.once('message', async (buffer) => {

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

            // send the message
            worker.postMessage(body);

        });
    }
};

/**
 * create a new worker based off the script
 * @param script the script to create a worker thread off of.
 * @returns {Worker}
 */
const createWorker = (script) => {
    const worker = new Worker(script);
    worker.on('exit', (code) => console.error('thread exited', code));
    worker.on('error', (error) => console.error(error));

    return worker;
};