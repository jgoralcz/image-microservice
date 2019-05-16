module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'rdog',
    workerScript: __dirname + '/rdog_worker.js',
    args: ['text']
};