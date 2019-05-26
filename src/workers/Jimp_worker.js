// the main script to run most of your commands so the threads can delegate which one
// canvas and sharp use their own threads which cause conflicts with worker threads.
const { parentPort, isMainThread } = require('worker_threads');
const bodypillow = require('./Bodypillow_worker.js');
const bodypillowMale = require('./BodypillowMale_worker.js');
const deepfry = require('./Deepfry_worker.js');
const fry = require('./Fry_worker.js');
const overfry = require('./Overfry_worker.js');
const jojoKira = require('./JojoKira_worker.js');
const jojoShock = require('./JojoShock_worker.js');
const jojoSmash = require('./JojoSmash_worker.js');
const jojoSmile = require('./JojoSmile_worker.js');
const phoneMeme = require('./PhoneMeme_worker.js');
const rdog = require('./Rdog_worker.js');
const trumphold = require('./TrumpHold_worker.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            const endpoint = message.endpoint;
            switch(endpoint) {
                case 'bodypillow':
                    buffer = await bodypillow.execute(message.body.image_url, message.buffer);
                break;

                case 'bodypillowmale':
                    buffer = await bodypillowMale.execute(message.body.image_url, message.buffer);
                break;

                case 'deepfry':
                    buffer = await deepfry.execute(message.body.image_url);
                break;

                case 'fry':
                    buffer = await fry.execute(message.body.image_url);
                break;

                case 'overfry':
                    buffer = await overfry.execute(message.body.image_url);
                break;

                case 'jojokira':
                    buffer = await jojoKira.execute(message.body.image_url, message.buffer);
                break;

                case 'jojoshock':
                    buffer = await jojoShock.execute(message.body.image_url, message.buffer);
                break;

                case 'jojosmash':
                    buffer = await jojoSmash.execute(message.body.image_url, message.buffer);
                break;

                case 'jojosmile':
                    buffer = await jojoSmile.execute(message.body.image_url, message.buffer);
                break;

                case 'phonememe':
                    buffer = await phoneMeme.execute(message.body.image_url, message.buffer);
                break;

                case 'rdog':
                    buffer = await rdog.execute(message.body.text);
                break;

                case 'trumphold':
                    buffer = await trumphold.execute(message.body.image_url, message.buffer);
                break;

            }
        } catch (error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}