const express = require('express');

const app = express();
const startFactory = require('./ExpressServiceFactory.js');

// start our express
app.use(express.json()); // we need to get the body in json format

// parse args
const args = process.argv.slice(2);
let threads = 3;
if (!isNaN(parseInt(args[0], 10))) {
  threads = parseInt(args[0], 10);
} else {
  console.error(`No processes detected or not a number. Defaulting to ${threads}.`);
}

// start the factory with our app
startFactory.init(app, threads);

// use / to give message
app.use('/', async (req, res) => {
  res.contentType('application/json');
  res.status(400);
  res.send('Please use the correct endpoints. See the github repo for the endpoints and check in the /src/endpoints folder.');
});
