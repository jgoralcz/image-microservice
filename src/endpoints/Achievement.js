const worker = require('../workers/canvas/Achievement_worker.js');
const gc = require('../EndpointsHelper/GenericCanvas.js');

module.exports =  {
    name: 'achievement',
    filepaths: ['./assets/images/achievement.png'],
    args: ['text'],

    /**
     * initiates the service
     * @param module our module.
     * @param expressApp the express app.
     */
    initService(module, expressApp) {
        gc.initService(module, expressApp, worker);
    }
};
