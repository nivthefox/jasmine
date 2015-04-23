var fs = require('fs');
var path = require('path');

/**
 * The main application constructor.
 *
 * @param {String} config
 * @constructor
 * @throws {Error}
 */
var Jasmine = function (config) {
    if (!config || !fs.existsSync(path.resolve(config))) {
        throw new Error;
    }
};

module.exports = Jasmine;