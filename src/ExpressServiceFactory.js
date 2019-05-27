const fs = require('fs');
const { Worker } = require('worker_threads');

module.exports = {
    endpoints: '/endpoints/',
    expressApp: undefined,
    jimpScript: './src/workers/Jimp_worker.js',
    workerArray: undefined,
    counter: 0,

    /**
     * inits the service.
     * @param app the express app
     * @param numThreads the number of worker threads.
     */
    init(app, numThreads) {
        this.dir = './src' + this.endpoints;
        this.expressApp = app;
        this.maxThreads = numThreads;
        this.createServicesAndWorkers();
    },

    /**
     * Creates the services and workers by looping over each file.
     * If a file has its own initService, we ignore it, and run theirs instead.
     * This is because Node-Canvas and Sharp use their own threading.
     * Additionally, it's up to the user if they want to add their own.
     */
    createServicesAndWorkers() {

        // create new worker threads based off their specification for the main script
        // this script does not use node-canvas or sharp because they use their own threading.
        this.workerArray = new Array(this.maxThreads);

        // persist the workers into its own array
        for(let i = 0; i < this.maxThreads; i++) {
            this.workerArray[i] = createWorker(this.jimpScript);
        }

        const serviceObj = {counter: this.counter, workerScript: this.jimpScript, maxThreads: this.maxThreads};

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
                await endpoint.initService(endpoint, this.expressApp, serviceObj);
            }
        });
    },

    /**
     * init service and use the requested process function
     * @param module the module to initialize
     * @param workerMessageListener worker message listener
     */
    initService(module, workerMessageListener) {

        // add the module nap to the express app
        this.expressApp.use(`/api/${module.name}`, (req, res) => {
            this.expressLogic(req, res, module, workerMessageListener);
        });
    },

    /**
     * logic for the endpoint.
     * @param req the request.
     * @param res the response.
     * @param module the module
     * @param workerMessageListener the worker listener to override if one is provided.
     */
    expressLogic(req, res, module, workerMessageListener) {

        // json body needed
        const body = req.body;

        // check for correct params
        const valid = this.checkValidParams(res, body, module);
        if(!valid) return;


        // simple way of queueing the threads
        this.counter++;
        if(this.counter >= this.maxThreads) this.counter = 0;
        const worker = this.workerArray[this.counter];

        // recovery method, create a new worker
        if(worker == null) {
            // create a new worker.
            this.workerArray[this.counter] = createWorker(this.jimpScript);

            // check if it's still null
            if(worker == null) {
                res.status(500);
                res.contentType('application/json');
                res.send('{"error": "image has errors."}');
                return;
            }
        }

        // no listener, add our own
        if(workerMessageListener) {
            module.workerMessageListener(req, res, worker);
        }
        else {
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
        }

        // send the message
        worker.postMessage({endpoint: module.name, body: body, buffer: module.buffer});
    },

    /**
     * checks for valid parameters
     * @param res the response object.
     * @param body the body of the request
     * @param args the module's args to test against
     * @returns {boolean}
     */
    checkValidParams(res, body, args) {

        // check the body to make sure we have the right args
        for(let i = 0; i < args.length; i++) {
            let arg = args[i];

            // no body with this argument, bad input
            if(!body[arg]) {
                res.status(400);
                res.contentType('application/json');
                res.send(`{"error": "Incorrect Parameters met. Needs: ${args}"}`);
                return false;
            }
        }

        return true;
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