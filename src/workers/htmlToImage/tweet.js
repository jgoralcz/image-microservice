const logger = require('log4js').getLogger();
const htmlToImage = require('node-html-to-image');
const axios = require('axios');

module.exports = {
  async execute(username, text, date) {
    try {
      const { status, data } = axios.get(`https://twitter.com/${username}`);
      // get gif first frame, then jimp read buffer then get base64
      const img = await Jimp.read(imageURL);
      return await img.scale(0.5).quality(70).getBase64Async(Jimp.MIME_JPEG);
    } catch (error) {
      logger.error(error, 'tweet failed');
    }
    return undefined;
  },
};
