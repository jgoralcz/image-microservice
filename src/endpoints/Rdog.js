const Jimp = require('jimp');
const path = require('path');
// const expServer = require('../ExpressServiceFactory.js');
const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');

module.exports =  {
    counter: 0,
    max: 1,

    /**
     * initiates the service
     * @param app
     * @returns {Promise<void>}
     */
    initService: async function (app) {
        this.image = await this.image;
        this.font = await this.font;

        if (isMainThread) {
            const name = 'rdog';
            const workerScript = path.join(__dirname, './rdog_worker.js');
            let worker = new Worker(workerScript);
            worker.on('error', (error) => console.error(error));

            worker.on('exit', (code) => {
                console.error('thread exited', code);
                // if (code !== 0) console.error(code);
            });
            let worker2 = new Worker(workerScript);
            worker2.on('error', (error) => console.error(error));

            worker2.on('exit', (code) => {
                console.error('thread exited', code);
                // if (code !== 0) console.error(code);
            });
            let count = 0;

            // const worker2 = new Worker(workerScript, {workerData: {text: 'text'}});
            app.use(`/image/${name}`, async function (req, res, next) {
                console.log('req.body', req.body);
                count++;


                // new worker if it doesn't exist
                if(worker == null) {
                    worker = new Worker(workerScript);
                    worker.on('error', (error) => console.error(error));

                    worker.on('exit', (code) => {
                        console.error('thread exited', code);
                        // if (code !== 0) console.error(code);
                    });
                }

                // new worker2 if it doesn't exist
                if(worker2 == null) {
                    worker2 = new Worker(workerScript);
                    worker2.on('error', (error) => console.error(error));

                    worker2.on('exit', (code) => {
                        console.error('thread exited', code);
                        // if (code !== 0) console.error(code);
                    });
                }


                // reset
                this.counter++;
                if(this.counter > this.max) this.counter = 0;


                if(this.counter === 0) {
                    // Listen for messages from the worker and print them.
                    worker.once('message', (buffer) => {

                        // make sure we have an uint8array
                        if (buffer instanceof Uint8Array) {
                            res.contentType('image/jpg');
                            res.send(Buffer.from(buffer));
                        }
                        else {
                            console.log('woopsie');
                        }
                    });
                    // send our info
                    worker.postMessage('test');
                }


                else {
                    worker2.once('message', (buffer) => {

                        // make sure we have an uint8array
                        if (buffer instanceof Uint8Array) {
                            res.contentType('image/jpg');
                            res.send(Buffer.from(buffer));
                        }
                        else {
                            console.log('woopsie');
                        }
                    });
                    // send our info
                    worker2.postMessage('test');
                }
            });
        }
    }
};