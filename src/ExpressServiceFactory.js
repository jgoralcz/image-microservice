const rdog = require('./endpoints/Rdog.js');
const { Worker} = require('worker_threads');

module.exports = class ExpressServiceFactory {

    constructor(app) {
        this.expressApp = app;
        this.loopServices().catch(console.error);
    }

    async loopServices() {
        // loop through files

        // take their variables and use them to build our stuff

        this.initService(rdog);
        // run all other files in this directory
    }

    /**
     * init service and use the requested process function
     * @param module the module to initialize
     */
    initService(module) {
        // create new worker threads based off their specification
        let workerArray = new Array(module.maxThreads);

        // persist the workers into its own array
        for(let i = 0; i < module.maxThreads; i++) {
            workerArray[i] = createWorker(module.workerScript);
        }

        // get the counter and max threads to loop through to "load balance" it out (kind of lazy way)
        let counter = module.counter;
        const maxThreads = module.maxThreads;

        // add the module nap to the express app
        this.expressApp.use(`/api/${module.name}`, function (req, res, next) {

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
            worker.postMessage(body);

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