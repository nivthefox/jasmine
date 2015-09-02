/*eslint no-console: 0*/
'use strict';

module.paths.unshift('.');
var pkg = require('package.json');
var fs = require('fs');
var util = require('util');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

module.exports.init = function (gamename) {
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
            console.log('Game "%s" created', gamename);
        })
        .done();
};

module.exports.start = function (gamename) {
    var pidfile = util.format('run/%s', gamename);

    fs.statAsync(pidfile)
        .then(function () {
            console.log('Game %s already started.', gamename);
            process.exit(1);
        })
        .catch(function () {
            var spawn = require('child_process').spawn;
            var out = fs.openSync('./out.log', 'a');
            var err = fs.openSync('./out.log', 'a');

            var options = {
                detached: true,
                env : {
                    NODE_PATH : util.format('./%s:.', gamename)
                },
                stdio : ['ignore', out, err]
            };

            var args = [util.format('%s/server.js', gamename), gamename];

            console.log('Starting Jasmine %s game %s.', pkg.version, gamename);

            var proc = spawn(process.execPath, args, options);
            fs.writeFileAsync(pidfile, proc.pid);

            proc.on('exit', function (code) {
                if (code !== 0) {
                    console.log('Process exited with status code %d', code);
                }
                fs.unlinkAsync(pidfile)
                    .done();
            });

            proc.on('message', function () {
                proc.unref();
            });
        });
};

module.exports.stop = function (gamename) {
    var pidfile = util.format('run/%s', gamename);

    fs.readFileAsync(pidfile)
        .then(function (pid) {
            pid = pid.toString('utf8');
            console.log('Stopping game %s.', gamename);


            process.kill(pid, 'SIGINT');

        })
        .catch(function () {
            console.log('Game %s not started.', gamename);
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
        '--colors',
        '--recursive',
        util.format('%s/test', gamename),
        'jasmine/test',
        '--reporter',
        'dot'
    ];

    var proc = spawn(process.execPath, args, options);
    proc.on('exit', function (code) {
        if (code === 0) {
            var args = [
                'node_modules/eslint/bin/eslint.js',
                '--color',
                'jasmine',
                gamename
            ];

            spawn(process.execPath, args, options);
        }
    });
};