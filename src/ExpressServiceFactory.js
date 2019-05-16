const rdog = require('./endpoints/rdog/Rdog.js');
const {Worker, isMainThread} = require('worker_threads');

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

        if (isMainThread) {
            // create new worker threads based off their specification
            let workerArray = new Array(module.maxThreads);

            // persist the workers into an array
            for(let i = 0; i < module.maxThreads; i++) {
                const worker = new Worker(module.workerScript);
                workerArray[i] = worker;

                worker.on('exit', (code) => console.error('thread exited', code));
                worker.on('error', (error) => console.error(error));
            }

            let counter = module.counter;
            const maxThreads = module.maxThreads;

            // const worker2 = new Worker(workerScript, {workerData: {text: 'text'}});
            this.expressApp.use(`/api/${module.name}`, function (req, res, next) {

                const body = req.body;

                // check the body to make sure we have the right args
                for(let i = 0; i < module.args.length; i++) {
                    let arg = module.args[i];

                    // no body
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

                if(worker == null) {
                    console.error('worker dead.');
                    res.status(500);
                    res.contentType('application/json');
                    res.send('{"error": "image has errors."}');
                    return;
                }

                worker.once('message', (buffer) => {

                    // make sure we have an uint8array
                    if (buffer instanceof Uint8Array) {
                        res.contentType('image/jpg');
                        res.send(Buffer.from(buffer));
                    }
                    else {
                        res.status(500);
                        res.contentType('application/json');
                        res.send('{"error": "server error, image has errors."}');
                    }
                });

                worker.postMessage(body);

            });
        }
    }
};