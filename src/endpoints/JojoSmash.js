module.exports =  {
    maxThreads: 2,
    name: 'jojosmash',
    workerScript:'./src/workers/JojoSmash_worker.js',
    args: ['image_url']
};