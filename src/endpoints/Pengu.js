const worker = require('../workers/canvas/Pengu_worker.js');
const gc = require('../EndpointsHelper/GenericCanvas.js');

module.exports =  {
    name: 'pengu',
    filepaths: ['./assets/images/pengu.jpg'],
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
