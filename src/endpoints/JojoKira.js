module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'jojokira',
    workerScript:'./src/workers/JojoKira_worker.js',
    args: ['image_url']
};