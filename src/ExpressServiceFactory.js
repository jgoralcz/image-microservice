const fs = require('fs');
const { Worker } = require('worker_threads');

module.exports = {
    endpoints: '/endpoints/',
    expressApp: undefined,
    jimpScript: './src/workers/Jimp_worker.js',

    /**
     * inits the service.
     * @param app the express app
     * @param numThreads the number of worker threads.
     */
    init: function (app, numThreads) {
        this.dir = './src' + this.endpoints;
        this.expressApp = app;
        this.maxThreads = numThreads || 5;
        this.createServicesAndWorkers();
    },

    /**
     * Creates the services and workers by looping over each file.
     * If a file has its own initService, we ignore it, and run theirs instead.
     * This is because Node-Canvas and Sharp use their own threading.
     * Additionally, it's up to the user if they want to add their own.
     */
    createServicesAndWorkers: function () {

        // loop through files, sync so we can get it over with
        fs.readdirSync(this.dir).forEach( async file =>  {
            // require the file then initialize the service.
            const endpoint = require('.' + this.endpoints + file);

            // if we don't have an overriding initService, then let's use ours
            if(!endpoint.initService) {
                this.initService(endpoint);

                // use our own initService
                if(endpoint.filepath != null) {
                    const file = fs.readFileSync(endpoint.filepath);
                    endpoint.buffer = Buffer.from(file);
                }
            }
            else {
                await endpoint.initService(endpoint, this.expressApp);
            }
        });

        // create new worker threads based off their specification for the main script
        // this script does not use node-canvas or sharp because they use their own threading.
        let workerArray = new Array(this.maxThreads);

        // persist the workers into its own array
        for(let i = 0; i < this.maxThreads; i++) {
            workerArray[i] = createWorker(this.jimpScript);
            console.log('worker', workerArray[i]);
        }
    },

    /**
     * init service and use the requested process function
     * @param module the module to initialize
     */
    initService(module) {

        // get the counter and max threads to loop through to "load balance" it out (kind of lazy way)
        let counter = 0;
        const maxThreads = this.maxThreads;

        // add the module nap to the express app
        this.expressApp.use(`/api/${module.name}`, (req, res) => {

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

            console.log(worker);

            // recovery method, create a new worker
            if(worker == null) {
                // create a new worker.
                workerArray[counter] = createWorker(this.jimpScript);

                // check if it's still null
                if(worker == null) {
                    res.status(500);
                    res.contentType('application/json');
                    res.send('{"error": "image has errors."}');
                    return;
                }
            }

            // listen for message back, which is hopefully a buffer image.
            worker.once('message', (buffer) => {

                // make sure we have an uint8array
                if (buffer instanceof Uint8Array) {
                    res.status(200);
                    res.contentType('image/jpg');
                    res.send(Buffer.from(buffer));
                }
                else {
                    res.status(500);
                    res.contentType('application/json');
                    res.send('{"error": "server error, image has errors."}');
                }
            });

            // send the message
            worker.postMessage({endpoint: module.name, body: body, buffer: module.buffer});

        });
    }
};

/**
 * create a new worker based off the script
 * @param script the script to create a worker thread off of.
 * @returns {Promise<void>}
 */
const createWorker = (script) => {
    const worker = new Worker(script);
    worker.on('exit', (code) => console.error('thread exited', code));
    worker.on('error', (error) => console.error(error));

    return worker;
};