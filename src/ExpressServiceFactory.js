const rdog = require('./endpoints/Rdog.js');

module.exports = class ExpressServiceFactory {

    static getExpressApp() {
        return this._expressApp;
    }

    static setExpressApp(app) {
        this._expressApp = app;
    }

    constructor() {

    }

    static async loopServices() {
        // run all other files in this directory
        const rdogObj = await new rdog();
        this.initService('rdog', rdogObj.process);
    }

    /**
     * init service and use the requested process function
     * @param name the name of the service
     * @param process the requested process function
     */
    static initService(name, process) {

        console.log(process);

        const { Worker, isMainThread, parentPort} = require('worker_threads');
        if (isMainThread) {
            // This code is executed in the main thread and not in the worker.

            const app = this.getExpressApp();

            app.use(`/image/${name}`, async (req, res, next) => {
                console.log(req.body);
                // create a new worker thread
                const worker = new Worker(__filename);

                // Listen for messages from the worker and print them.
                worker.once('message', (buffer) => {

                    if(buffer) {
                        res.contentType('image/jpg');
                        res.send(buffer);
                    }
                });

                worker.on('error', (error) => console.error(error));

                worker.on('exit', (code) => {
                    if(code !== 0) console.error(code);
                });

                // send our info
                worker.postMessage(req.body.text);

            });
        }
        else {

            // let our thread do the work for us.
            parentPort.once('message', async (message) => {

                console.log(process);

                // delegate to class with
                const buffer = await process(message);
                console.log(buffer);

                parentPort.postMessage(buffer);
            });
        }
    }
};