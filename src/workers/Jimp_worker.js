// the main script to run most of your commands so the threads can delegate which one
// canvas and sharp use their own threads which cause conflicts with worker threads.
const { parentPort, isMainThread } = require('worker_threads');
const bodypillow = require('./jimp/Bodypillow_worker.js');
const bodypillowMale = require('./jimp/BodypillowMale_worker.js');
const deepfry = require('./jimp/Deepfry_worker.js');
const fry = require('./jimp/Fry_worker.js');
const overfry = require('./jimp/Overfry_worker.js');
const jojoKira = require('./jimp/JojoKira_worker.js');
const jojoShock = require('./jimp/JojoShock_worker.js');
const jojoSmash = require('./jimp/JojoSmash_worker.js');
const jojoSmile = require('./jimp/JojoSmile_worker.js');
const phoneMeme = require('./jimp/PhoneMeme_worker.js');
const rdog = require('./jimp/Rdog_worker.js');
const trumphold = require('./jimp/TrumpHold_worker.js');
const noteImage = require('./jimp/NoteImage_worker.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            const endpoint = message.endpoint;
            const body = message.body;
            switch(endpoint) {

                case 'bodypillow':
                    buffer = await bodypillow.execute(body.image_url, message.buffer);
                break;

                case 'bodypillowmale':
                    buffer = await bodypillowMale.execute(body.image_url, message.buffer);
                break;

                case 'deepfry':
                    buffer = await deepfry.execute(body.image_url);
                break;

                case 'fry':
                    buffer = await fry.execute(body.image_url);
                break;

                case 'overfry':
                    buffer = await overfry.execute(body.image_url);
                break;

                case 'jojokira':
                    buffer = await jojoKira.execute(body.image_url, message.buffer);
                break;

                case 'jojoshock':
                    buffer = await jojoShock.execute(body.image_url, message.buffer);
                break;

                case 'jojosmash':
                    buffer = await jojoSmash.execute(body.image_url, message.buffer);
                break;

                case 'jojosmile':
                    buffer = await jojoSmile.execute(body.image_url, message.buffer);
                break;

                case 'phonememe':
                    buffer = await phoneMeme.execute(body.image_url, message.buffer);
                break;

                case 'rdog':
                    buffer = await rdog.execute(body.text, message.buffer);
                break;

                case 'trumphold':
                    buffer = await trumphold.execute(body.image_url, message.buffer);
                break;

                case 'noteimage':
                    buffer = await noteImage.execute(body.image_url, message.buffer);
                break;

            }
        } catch (error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}