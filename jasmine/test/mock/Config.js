'use strict';

module.exports.config = {};
module.exports.get = function (value) {
    return module.exports.config[value];
};
