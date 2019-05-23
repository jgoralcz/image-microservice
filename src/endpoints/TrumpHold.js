module.exports =  {
    maxThreads: 2,
    name: 'trumphold',
    workerScript:'./src/workers/TrumpHold_worker.js',
    args: ['image_url']
};