module.exports =  {
    counter: 0,
    maxThreads: 1,
    name: 'rdog',
    workerScript:'./src/workers/Rdog_worker.js',
    args: ['text']
};