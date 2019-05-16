module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'rdog',
    workerScript:'./src/workers/Rdog_worker.js',
    args: ['text']
};