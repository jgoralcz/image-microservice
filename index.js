const express = require('express');
const startFactory = require('./src/ExpressServiceFactory.js');
// const Jimp = require('jimp');

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

// start the factory with our app
new startFactory();
startFactory.setExpressApp(app);
startFactory.loopServices().catch(console.error);
