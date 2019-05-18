module.exports =  {
    counter: 0,
    maxThreads: 2,
    name: 'bodypillowmale',
    workerScript:'./src/workers/BodypillowMale_worker.js',
    args: ['image_url']
};