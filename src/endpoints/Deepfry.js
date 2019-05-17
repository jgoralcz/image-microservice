module.exports =  {
    counter: 0,
    maxThreads: 1,
    name: 'deepfry',
    workerScript:'./src/workers/Deepfry_worker.js',
    args: ['image_url']
};