const bodyparser = require('body-parser');
const express = require('express');
const logger = require('log4js').getLogger();
const { errorHandler } = require('./middleware/errorHandler.js');
const { httpLogger } = require('./middleware/logger');
const { LOCAL } = require('./util/constants/environments');
const startFactory = require('./ExpressServiceFactory.js');

const { processes } = require('../config.json');

logger.level = 'info';
const port = process.env.PORT || 8443;
const env = process.env.NODE_ENV || LOCAL;

const server = express();

server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(httpLogger());

const defaultProcesses = 3;
const forkNumProcess = isNaN(parseInt(processes, 10)) ? defaultProcesses : parseInt(processes, 10);
if (isNaN(parseInt(processes, 10))) {
  logger.warn(`No number specified in arguments for number of processess/threads to spawn. Defaulting to ${defaultProcesses}`);
}

logger.info(`Starting server with ${forkNumProcess} processes...`);

startFactory.init(server, forkNumProcess).then(() => {
  server.use('/', async (_, res) => {
    res.contentType('application/json');
    res.status(400);
    res.send('Please use the correct endpoints. See the github repo for the endpoints and check in the /src/endpoints folder.');
  }, errorHandler);

  server.listen(port, () => logger.info(`${env.toUpperCase()} server started on ${port}.`));
}).catch((error) => {
  logger.error('error occured when starting server:', error);
  process.exit(-1);
});
