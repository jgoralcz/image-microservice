const worker = require('../workers/canvas/ChangeMyMind_worker.js');
const tweet = require('../EndpointsHelper/GenericCanvas.js');

module.exports =  {
    name: 'changemymind',
    filepath: ['./assets/images/changemymind_template.jpg'],
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
