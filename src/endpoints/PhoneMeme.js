module.exports =  {
    maxThreads: 2,
    name: 'phonememe',
    workerScript:'./src/workers/PhoneMeme_worker.js',
    args: ['image_url']
};