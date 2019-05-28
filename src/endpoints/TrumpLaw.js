const worker = require('../workers/canvas/TrumpLaw_worker.js');
const tweet = require('../EndpointsHelper/GenericCanvas.js');

module.exports =  {
    name: 'trumplaw',
    filepaths: ['./assets/images/trumplaw.jpg'],
    args: ['text'],

    /**
     * initiates the service
     * @param module our module.
     * @param expressApp the express app.
     */
    initService(module, expressApp) {
        tweet.initService(module, expressApp, worker);
    }
};
