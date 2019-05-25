module.exports =  {
    maxThreads: 2,
    name: 'bobross',
    workerScript:'./src/workers/BobRoss_worker.js',
    args: ['image_url']
};