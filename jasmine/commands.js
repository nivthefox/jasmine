"use strict";

var util = require('util');
var Promise = require('bluebird');

module.exports.init = function (gamename) {
    var fs = require('fs');
    Promise.promisifyAll(fs);

    var os = require('os');

    var ncp = require('ncp').ncp;
    ncp.limit = os.cpus().length;
    ncp = Promise.promisify(ncp);

    var path = util.format('%s/%s', process.cwd(), gamename);

    fs.statAsync(path)
        .then(function () { // Directory exists, exit.
            console.log('Directory %s already exists.', gamename);
            process.exit(73);
        })
        .catch(function () { // Directory does not exist, continue.
            return ncp('./jasmine/game', path);
        })
        .catch(function (e) { // Unable ot create directory.
            console.log(e);
            process.exit(73);
        })
        .then(function () { // Directory created.
            console.log('game "%s" created', gamename);
        })
        .done();
};

module.exports.test = function (gamename) {
    var spawn = require('child_process').spawn;

    var options = {
        env : {
            NODE_PATH : util.format('./%s:.', gamename)
        },
        stdio : 'inherit'
    };
    var args = [
        'node_modules/istanbul-harmony/lib/cli.js',
        'cover',
        '--report',
        'text-summary',
        '--',
        'node_modules/mocha/bin/_mocha',
        '--recursive',
        util.format('%s/test', gamename),
        'jasmine/test',
        '--reporter',
        'spec'
    ];

    spawn(process.execPath, args, options);

};