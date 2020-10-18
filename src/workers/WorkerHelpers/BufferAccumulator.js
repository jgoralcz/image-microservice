const { Writable } = require('stream');

module.exports = class MyBufferAccumulator extends Writable {
  constructor() {
    super();
    this.accumulator = Buffer.from('');
    this.finished = false;
    this.once('finish', () => { this.finished = true; });
  }

  // eslint-disable-next-line no-underscore-dangle
  _write(chunk, encoding, callback) {
    this.accumulator = Buffer.concat([this.accumulator, chunk]);
    if (typeof encoding === 'function') { encoding(); }
    if (typeof callback === 'function') { callback(); }
  }

  async getBuffer() {
    if (this.finished) { return this.accumulator; }
    return new Promise((rs, rj) => {
      this.once('finish', () => rs(this.accumulator));
      this.once('error', (err) => rj(err));
    });
  }
};
