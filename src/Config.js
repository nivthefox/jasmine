'use strict';

var Promise = require('bluebird');
var fs = require('fs');
if (!fs.readFileAsync) {
    fs = Promise.promisifyAll(fs);
}
var path = require('path');
var yaml = require('js-yaml');

var Config = {};

module.exports.get = function (val) {
    return Config[val];
};

module.exports.load = function (file) {
    if (!file || !fs.existsSync(path.resolve(file))) {
        return new Error;
    }

    return fs.readFileAsync(path.resolve(file))
        .then(function (data) {
            Config = yaml.load(data);
        });
};
