module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'bodypillow',
    workerScript:'./src/workers/Bodypillow_worker.js',
    args: ['image_url']
};