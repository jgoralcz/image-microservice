module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'jojosmash',
    workerScript:'./src/workers/JojoSmash_worker.js',
    args: ['image_url']
};