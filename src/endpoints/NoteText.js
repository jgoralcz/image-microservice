const tweet = require('../EndpointsHelper/GenericCanvas.js');
const worker = require('../workers/canvas/NoteText_worker.js');

module.exports = {
    name: 'notetext',
    filepath: './assets/images/noteText.jpg',
    args: ['text'],

    /**
     * the module to add
     * @param module the module (this)
     * @param expressApp the express app
     */
    async initService(module, expressApp) {
        tweet.initService(module, expressApp, worker);
    }
};
