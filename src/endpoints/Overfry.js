const deepfry = require('./Deepfry.js');

module.exports =  {
    counter: 0,
    maxThreads: 5,
    name: 'overfry',
    workerScript:'./src/workers/Overfry_worker.js',
    args: ['image_url'],

    /**
     * the module to add
     * @param module the module (this)
     * @param expressApp the express app
     */
    initService(module, expressApp) {
        deepfry.initService(module, expressApp);
    }
};