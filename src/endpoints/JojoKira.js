module.exports =  {
    maxThreads: 2,
    name: 'jojokira',
    workerScript:'./src/workers/JojoKira_worker.js',
    args: ['image_url']
};