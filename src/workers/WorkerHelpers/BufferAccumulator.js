const { Writable } = require('stream');

module.exports = class MyBufferAccumulator extends Writable {
  constructor() {
    super();
    this.accumulator = Buffer.from('');
    this.finished = false;
    this.once('finish', () => { this.finished = true; });
  }

  _write(chunk, encoding, callback) {
    // tslint:disable-next-line:no-console
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
}
