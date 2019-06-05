const fs = require('fs');
const {fork} = require('child_process');

module.exports = {
    endpoints: '/endpoints/',
    expressApp: undefined,
    jimpScript: './src/workers/ControllerScript.js',
    workerArray: undefined,
    counter: 0,
    requestNum: 0,
    responses: [],

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
     * Creates the services and workers by looping over each filepath.
     * If a filepath has its own initService, we ignore it, and run theirs instead.
     * This is because Node-Canvas and Sharp use their own threading.
     * Additionally, it's up to the user if they want to add their own.
     */
    createServicesAndWorkers() {

        // create new worker threads based off their specification for the main script
        // this script does not use node-canvas or sharp because they use their own threading.
        this.workerArray = new Array(this.maxThreads);

        // persist the workers into its own array
        for(let i = 0; i < this.maxThreads; i++) {
            // console.log('creating');
            this.workerArray[i] = createWorker(this.jimpScript, this.responses);
        }


        const serviceObj = {counter: this.counter, workerScript: this.jimpScript, maxThreads: this.maxThreads};

        // loop through files, sync so we can get it over with
        fs.readdirSync(this.dir).forEach( async file =>  {
            // require the filepath then initialize the service.
            const endpoint = require('.' + this.endpoints + file);

            // add buffer to our endpoint
            if(endpoint.filepaths != null) {
                endpoint.buffers = [];
                for(let i = 0; i < endpoint.filepaths.length; i++) {
                    const file = fs.readFileSync(endpoint.filepaths[i]);
                    endpoint.buffers.push(Buffer.from(file));
                }
            }

            // if we don't have an overriding initService, then let's use ours
            if(!endpoint.initService) {
                this.initService(endpoint);
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
        const valid = this.checkValidParams(res, body, module.args);
        if(!valid) return;

        // push request onto array
        this.responses.push({requestNum: this.requestNum, res: res});

        // simple way of queueing the threads/processes
        this.counter++;
        if(this.counter >= this.maxThreads) this.counter = 0;
        const worker = this.workerArray[this.counter];

        // recovery method, create a new worker
        // if(worker == null) {
        //     // create a new worker.
        //     this.workerArray[this.counter] = createWorker(this.jimpScript);
        //
        //     // check if it's still null
        //     if(worker == null) {
        //         res.status(500);
        //         res.contentType('application/json');
        //         res.send('{"error": "Major Internal Error. Please notify the owners."}');
        //         return;
        //     }
        // }

        // send the message
        worker.send({endpoint: module.name, body: body, buffers: module.buffers, requestNum: this.requestNum});

        this.requestNum++;
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
 * @param responses the list of resposnes we have to take care of.
 * @returns {Promise<void>}
 */
const createWorker = (script, responses) => {
    const worker = fork(script, [], {stdio: 'inherit'});

    // listen for message back, which is hopefully a buffer image.
    worker.on('message', (message) => {
        //TODO: if not message.buffer, send 500 cut out our response
        if(message == null || !message.buffer || !message.buffer.data) {
            console.log('woops');
        }

        let buffer = message.buffer.data;
        const requestNum = message.requestNum;

        if(buffer != null && (typeof buffer !== 'string' && !(buffer instanceof String))) {
            buffer = Buffer.from(buffer);
        }

        // get our response to send back to.
        let response;
        for(let i = 0; i < responses.length; i++) {
            response = responses[i];
            if(response.requestNum === requestNum) {
                response = responses[i].res;
                responses.splice(i, 1);
                break;
            }
        }

        // make sure we have an uint8array
        if (buffer instanceof Uint8Array) {
            response.status(200);
            response.contentType('image/jpg');
            response.send(buffer);
        }
        // send string if we have that (for ascii images or url)
        else if(typeof buffer === 'string' || buffer instanceof String) {
            response.status(200);
            response.contentType('application/json');
            response.send(`{"content": "${buffer}"}`);
        }
        else {
            response.status(500);
            response.contentType('application/json');
            response.send('{"error": "server error, image has errors."}');
        }
    });

    return worker;
};