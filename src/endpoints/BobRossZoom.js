module.exports =  {
    maxThreads: 2,
    name: 'bobrosszoom',
    workerScript:'./src/workers/bobrosszoom_worker.js',
    args: ['image_url']
};