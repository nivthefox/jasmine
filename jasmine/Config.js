'use strict';

const Promise = require('bluebird');
let fs = require('fs');
if (!fs.readFileAsync) {
    fs = Promise.promisifyAll(fs);
}
const path = require('path');
const yaml = require('js-yaml');

let Config;

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
