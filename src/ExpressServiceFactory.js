const fs = require('fs');
const { fork } = require('child_process');
const gifFrames = require('gif-frames');
const MyBufferAccumulator = require('./workers/WorkerHelpers/BufferAccumulator');
const util = require('util');
const readdir = util.promisify(fs.readdir);


/**
 * filters out the responses for the correct response to send
 * @param responses the responses we have in the queue.
 * @param requestNum the request number that the response belonged to.
 * @returns {Promise<boolean>}
 */
const filterResponses = async (responses, requestNum) => {
  for (let i = 0; i < responses.length; i += 1) {
    let response = responses[i];
    if (response.requestNum === requestNum) {
      response = responses[i].res;
      responses.splice(i, 1);
      return response;
    }
  }
  return undefined;
};

/**
 * create a new worker based off the script
 * @param script the script to create a worker thread off of.
 * @param responses the list of responses we have to take care of.
 * @returns {ChildProcess}
 */
const createWorker = (script, responses) => {
  const worker = fork(script, [], { stdio: 'inherit' });

  // listen for message back, which is hopefully a buffer image.
  worker.on('message', async (message) => {
    if (message == null || !message.buffer || !message.buffer.data) {
      if (message && message.requestNum != null) {
        const response = await filterResponses(responses, message.requestNum);
        response.status(500);
        response.contentType('application/json');
        response.send('{ "error": "server error, image has errors." }');
      }
      return;
    }

    let buffer = message.buffer.data;
    const { requestNum, contentType } = message;

    // make sure we have the right buffer.
    if (buffer != null && (typeof buffer !== 'string' && !(buffer instanceof String))) {
      buffer = Buffer.from(buffer);
    }

    // get our response to send back to.
    const response = await filterResponses(responses, requestNum);

    if (!response) {
      console.error('Could not find response for this requested number.');
      return;
    }

    // make sure we have an uint8array
    if (buffer instanceof Uint8Array) {
      response.status(200);
      response.contentType(contentType);
      response.send(buffer);
      // send string if we have that (for ascii images or url)
    } else if (typeof buffer === 'string' || buffer instanceof String) {
      response.status(200);
      response.contentType('application/json');
      response.send(buffer);
    } else {
      response.status(500);
      response.contentType('application/json');
      response.send('{ "error": "server error, image has errors." }');
    }
  });

  return worker;
};

module.exports = {
  endpoints: '/endpoints/',
  expressApp: undefined,
  jimpScript: './src/workers/ControllerScript.js',
  workerArray: undefined,
  counter: 0,
  requestNum: 0,
  responses: [],
  interval: undefined,

  /**
   * inits the service.
   * @param app the express app
   * @param numThreads the number of worker threads.
   */
  async init(app, numThreads) {
    this.dir = `./src${this.endpoints}`;
    this.expressApp = app;
    this.maxThreads = numThreads;
    await this.createServicesAndWorkers();

    // set interval
    this.interval = setInterval(() => {
      // clear all responses that are too old (perhaps some error?
      if (this.responses && this.responses.length > 0) {
        // loop over all that are too old
        // (2 minutes because it should only take a max of 2 seconds to process an image.)
        for (let i = 0; i < this.responses.length; i += 1) {
          let response = this.responses[i];
          // check by the timestamp
          if (response.timestamp) {
            const time = response.timestamp.getTime();
            const twoMinutes = 1000 * 60 * 2;

            // get time makes sure it's greater than 2 minutes
            if (new Date().getTime() - time > twoMinutes) {
              console.log('cleaning');
              response = this.responses[i].res;
              this.responses.splice(i, 1);
            }
          }
          console.log(this.responses);
        }
      }
    }, 6e5); // 10 minutes
  },

  /**
   * Creates the services and workers by looping over each filepath.
   * If a filepath has its own initService, we ignore it, and run theirs instead.
   * This is because Node-Canvas and Sharp use their own threading.
   * Additionally, it's up to the user if they want to add their own.
   */
  async createServicesAndWorkers() {
    // create new processes (worker threads in the future) based off their specification for the main script
    this.workerArray = new Array(this.maxThreads);

    // persist the workers into its own array
    for (let i = 0; i < this.maxThreads; i += 1) {
      this.workerArray[i] = createWorker(this.jimpScript, this.responses);
    }

    const serviceObj = {
      counter: this.counter,
      workerScript: this.jimpScript,
      maxThreads: this.maxThreads,
    };

    // loop through files, sync so we can get it over with
    const files = await readdir(this.dir);
    for ( const file of files) {
      // require the filepath then initialize the service.
      // eslint-disable-next-line import/no-dynamic-require,global-require
      const endpoint = require(`.${this.endpoints}${file}`);

      // add buffer to our endpoint
      if (endpoint.filepaths != null) {
        endpoint.buffers = [];
        // loop through our files.
        for (let i = 0; i < endpoint.filepaths.length; i += 1) {
          // read gifs special because they have more than 1 buffer.
          if (endpoint.filepaths[i].endsWith('gif')) {
            const frames = await gifFrames({ url: endpoint.filepaths[i], frames: 'all' });
            for (let f = 0; f < frames.length; f += 1) {
              const accumulator = new MyBufferAccumulator();
              frames[f].getImage().pipe(accumulator);
              endpoint.buffers.push(await accumulator.getBuffer());
            }
            // otherwise read image normally.
          } else {
            const readFile = fs.readFileSync(endpoint.filepaths[i]);
            endpoint.buffers.push(Buffer.from(readFile));
          }
        }
      }


      // if we don't have an overriding initService, then let's use ours
      if (!endpoint.initService) {
        this.initService(endpoint);
      } else {
        await endpoint.initService(endpoint, this.expressApp, serviceObj);
      }
    }
  },

  /**
   * init service and use the requested process function
   * @param module the module to initialize
   */
  initService(module) {
    // add the module nap to the express app
    this.expressApp.use(`/api/${module.name}`, (req, res) => {
      this.expressLogic(req, res, module);
    });
  },

  /**
   * basic logic for the endpoint.
   * @param req the request object.
   * @param res the response object.
   * @param module the module to work with.
   */
  expressLogic(req, res, module) {
    // json body needed
    const { body } = req;

    // check for correct params
    const valid = this.checkValidParams(body, module.args);
    if (!valid) {
      res.status(400);
      res.contentType('application/json');
      res.send(`{"error": "Incorrect Parameters met. Needs: ${module.args}"}`);
    }

    // push request onto array
    // timestamp in case something happens,
    // we want to remove the requests that are older than 5 minutes.
    this.responses.push({ requestNum: this.requestNum, res, timestamp: new Date() });

    // simple way of queueing the threads/processes
    this.counter += 1;
    if (this.counter >= this.maxThreads) this.counter = 0;
    const worker = this.workerArray[this.counter];

    // recovery method, create a new worker/process
    if (worker == null) {
      // create a new worker.
      this.workerArray[this.counter] = createWorker(this.jimpScript, this.responses);

      // check if it's still null
      if (worker == null) {
        res.status(500);
        res.contentType('application/json');
        res.send('{ "error": "Major Internal Error. Please notify the owners." }');
        return;
      }
    }

    if (worker != null) {
      // send the message
      worker.send({
        endpoint: module.name, body, buffers: module.buffers, requestNum: this.requestNum, contentType: module.contentType || 'image/jpeg',
      });
    }

    // increment then reset if necessary
    this.requestNum += 1;
    if (this.requestNum > 10000) this.requestNum = 0;
  },

  /**
   * checks for valid parameters
   * @param body the body of the request
   * @param args the module's args to test against
   * @returns {boolean}
   */
  checkValidParams(body, args) {
    return args.every((arg) => body[arg] != null && body[arg] !== '');
  },
};
