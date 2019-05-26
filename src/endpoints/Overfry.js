const deepfry = require('./Deepfry.js');

module.exports =  {
    name: 'overfry',
    args: ['image_url'],

    /**
     * the worker message listener for this endpoint.
     * @param req the request object.
     * @param res the response object.
     * @param worker the worker thread.
     * @returns {*}
     */
    workerMessageListener: function(req, res, worker) {
        deepfry.workerMessageListener(req, res, worker);
    }
};