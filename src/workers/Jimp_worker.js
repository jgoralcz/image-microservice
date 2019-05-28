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
const top10anime = require('./jimp/Top10AnimeBattles_worker.js');
const policeposter = require('./jimp/PolicePoster_worker.js');
const payrespects = require('./jimp/PayRespects_worker.js');
const mariojumping = require('./jimp/MarioJumping_worker.js');
const sunnyframe = require('./jimp/SunnyFrame_worker.js');
const loveher = require('./jimp/LoveHer_worker.js');
const dio = require('./jimp/Dio_worker.js');
const dateline = require('./jimp/Dateline_worker.js');
const nope = require('./jimp/Nope_worker.js');
const hot = require('./jimp/Hot_worker.js');
const jojowallet = require('./jimp/JojoWallet_worker.js');
const ihadto = require('./jimp/IHadTo_worker.js');
const vsauce = require('./jimp/VSauce_worker.js');
const hatkidsays = require('./jimp/HatKidSays_worker.js');
const halloweenify = require('./jimp/Halloweenify_worker.js');
const blurpify = require('./jimp/Blurpify_worker.js');
const sonicsays = require('./jimp/SonicSays_worker.js');
const jpegify = require('./jimp/Jpegify_worker.js');
const homie = require('./jimp/Homie_worker.js');
const bazinga = require('./jimp/Bazinga_worker.js');
const blur = require('./jimp/Blur_worker.js');
const ascii = require('./jimp/Ascii_worker.js');

// check that the sorter was called as a worker thread
if (!isMainThread) {

    parentPort.on('message', async (message) => {

        let buffer;
        try {
            const endpoint = message.endpoint;
            const body = message.body;
            switch(endpoint) {

                case 'bodypillow':
                    buffer = await bodypillow.execute(body.image_url, message.buffers);
                break;

                case 'bodypillowmale':
                    buffer = await bodypillowMale.execute(body.image_url, message.buffers);
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
                    buffer = await jojoKira.execute(body.image_url, message.buffers);
                break;

                case 'jojoshock':
                    buffer = await jojoShock.execute(body.image_url, message.buffers);
                break;

                case 'jojosmash':
                    buffer = await jojoSmash.execute(body.image_url, message.buffers);
                break;

                case 'jojosmile':
                    buffer = await jojoSmile.execute(body.image_url, message.buffers);
                break;

                case 'phonememe':
                    buffer = await phoneMeme.execute(body.image_url, message.buffers);
                break;

                case 'rdog':
                    buffer = await rdog.execute(body.text, message.buffers);
                break;

                case 'trumphold':
                    buffer = await trumphold.execute(body.image_url, message.buffers);
                break;

                case 'noteimage':
                    buffer = await noteImage.execute(body.image_url, message.buffers);
                break;

                case 'top10animebattles':
                case 'top10animesad':
                case 'top10animebrutal':
                case 'top10animebetrayal':
                    buffer = await top10anime.execute(body.image_url, message.buffers);
                break;

                case 'policeposter':
                    buffer = await policeposter.execute(body.image_url, message.buffers);
                break;

                case 'payrespects':
                    buffer = await payrespects.execute(body.image_url, message.buffers);
                break;

                case 'mariojumping':
                    buffer = await mariojumping.execute(body.image_url, message.buffers);
                break;

                case 'sunnyframe':
                case 'sunnyframequote':
                    buffer = await sunnyframe.execute(body.image_url, message.buffers);
                break;

                case 'loveher':
                    buffer = await loveher.execute(body.image_url, message.buffers);
                break;

                case 'dio':
                    buffer = await dio.execute(body.image_url, message.buffers);
                break;

                case 'dateline':
                    buffer = await dateline.execute(body.image_url, message.buffers);
                break;

                case 'nope':
                    buffer = await nope.execute(body.image_url, message.buffers);
                break;

                case 'jojowallet':
                    buffer = await jojowallet.execute(body.image_url, message.buffers);
                break;

                case 'hot':
                    buffer = await hot.execute(body.image_url, message.buffers);
                break;

                case 'ihadto':
                    buffer = await ihadto.execute(body.image_url, message.buffers);
                break;

                case 'vsauce':
                    buffer = await vsauce.execute(body.image_url, message.buffers);
                break;

                case 'hatkidsays':
                case 'hatkidsayssmug':
                    buffer = await hatkidsays.execute(body.text, message.buffers);
                break;

                case 'halloweenify':
                    buffer = await halloweenify.execute(body.image_url, parseInt(body.threshold || 1));
                break;

                case 'blurpify':
                    buffer = await blurpify.execute(body.image_url);
                break;

                case 'sonicsays':
                    buffer = await sonicsays.execute(body.text, message.buffers);
                break;

                case 'jpegify':
                    buffer = await jpegify.execute(body.image_url);
                break;

                case 'homie':
                    buffer = await homie.execute(body.image_url, message.buffers);
                break;

                case 'bazinga':
                    buffer = await bazinga.execute(body.image_url, message.buffers);
                break;

                case 'blur':
                    buffer = await blur.execute(body.image_url, parseInt(body.number || 1));
                break;

                case 'ascii':
                    buffer = await ascii.execute(body.image_url);
                break;


            }
        } catch (error) {
            console.error(error);
        }
        parentPort.postMessage(buffer);
    });
}