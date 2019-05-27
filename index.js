const express = require('express');
const startFactory = require('./src/ExpressServiceFactory.js');

const app = express();
app.use(express.json()); // we need to get the body in json format

// use / to give message
// app.use(`/`, async (req, res, next) => {
//
//     res.contentType('application/json');
//     res.status(400);
//     res.send('Please use the correct endpoints. See the github repo for the endpoints.');
//
// });

app.listen(9002);

// parse args
const args = process.argv.slice(2);
let threads = 10;
if(!isNaN(args[0])) {
    threads = parseInt(args[0]);
}
else {
    console.error(`No threads detected or not a number. Defaulting to ${threads}.`);
}

// start the factory with our app
startFactory.init(app, threads);
