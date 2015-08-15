'use strict';

let util = require('util');

/**
 * Determines the time left in a timeout or interval.
 *
 * Possibly innacurate +/- 10ms
 *
 * @param {timeout|interval} timer
 * @return {Number}
 */
util.getTimeLeft = function (timer) {
    return Math.ceil(timer._idleStart + timer._idleTimeout - (process.uptime() * 1000));
};

module.exports = util;
