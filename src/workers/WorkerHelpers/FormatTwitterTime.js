const monthNames = ['January', 'February', 'March', 'April', 'May',
  'June', 'July', 'August', 'September', 'October', 'November', 'December'];

module.exports = {

  /**
   * formats the time based off of twitter format
   * @returns {string}
   */
  formatTwitterTime() {
    const date = new Date();

    const day = date.getDate();
    let month = date.getMonth();
    const year = date.getFullYear();

    month = monthNames[month].substring(0, 3);

    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours %= 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes} ${ampm} - ${day} ${month} ${year}`;
  },
};
