module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'jojoshock',
    workerScript:'./src/workers/JojoShock_worker.js',
    args: ['image_url']
};