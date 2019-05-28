const worker = require('../workers/canvas/WhyFBIHere_worker.js');
const gc = require('../EndpointsHelper/GenericCanvas.js');

module.exports =  {
    name: 'whyfbihere',
    filepaths: ['./assets/images/fbi_here.jpg', './assets/images/fbi_here_overlay.jpg'],
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
