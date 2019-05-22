module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'jojosmile',
    workerScript:'./src/workers/JojoSmile_worker.js',
    args: ['image_url']
};