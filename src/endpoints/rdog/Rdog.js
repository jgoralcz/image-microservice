const {Worker, isMainThread} = require('worker_threads');

module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'rdog',
    workerScript: __dirname + '/rdog_worker.js',


    /**
     * initiates the service
     * @param app
     * @returns {Promise<void>}
     */
    initService: async function (app) {
        if (isMainThread) {

            // create new worker threads based off their specification
            let workerArray = new Array(this.maxThreads);

            for(let i = 0; i < this.maxThreads; i++) {
                const worker = new Worker(this.workerScript);
                workerArray[i] = worker;
                console.log('added worker');

                worker.on('exit', (code) => console.error('thread exited', code));
                worker.on('error', (error) => console.error(error));
            }

            let counter = this.counter;
            const maxThreads = this.maxThreads;

            // const worker2 = new Worker(workerScript, {workerData: {text: 'text'}});
            app.use(`/api/${this.name}`, async function (req, res, next) {

                console.log(req.body);

                counter++;
                if(counter >= maxThreads) counter = 0;
                const worker = workerArray[counter];

                if(worker == null) {
                    res.statusCode(500);
                    res.contentType('application/json');
                    res.send('{"error": "image has errors."}');
                    return;
                }

                worker.once('message', (buffer) => {
                    console.log('thread', counter);

                    // make sure we have an uint8array
                    if (buffer instanceof Uint8Array) {
                        res.contentType('image/jpg');
                        res.send(Buffer.from(buffer))
                    }
                    else {
                        res.statusCode(500);
                        res.contentType('application/json');
                        res.send('{"error": "image has errors."}');
                        return;
                    }
                });

                worker.postMessage('test');

            });
        }
    }
};