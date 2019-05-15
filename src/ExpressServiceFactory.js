const rdog = require('./endpoints/Rdog.js');

module.exports = class ExpressServiceFactory {

    static getExpressApp() {
        return this._expressApp;
    }

    static setExpressApp(app) {
        this._expressApp = app;
    }

    constructor() {

    }

    static async loopServices() {
        // loop through files
        // run their main


        await rdog.initService(this.getExpressApp());
        // run all other files in this directory
        // const rdogObj = await new rdog(this.getExpressApp());
        // this.initService('rdog', rdogObj.process);
    }

    /**
     * init service and use the requested process function
     * @param name the name of the service
     * @param process the requested process function
     */
    static initService(name, process) {

    }
};