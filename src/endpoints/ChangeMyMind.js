const worker = require('../workers/canvas/ChangeMyMind_worker.js');
const gc = require('../EndpointsHelper/GenericCanvas.js');

module.exports =  {
    name: 'changemymind',
    filepaths: ['./assets/images/changemymind_template.jpg'],
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
