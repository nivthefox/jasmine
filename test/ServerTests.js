/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * Copyright (C) 2013 Kevin Kragenbrink <kevin@writh.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

suite('Server');
require('../config.js');

var Assert = require('assert');
var Server = require($SRC_DIR + '/Server');
var fixtures = require($ROOT_DIR + '/test/fixtures/Server');
var net = require('net');

test(': Cannot be constructed without config object.', function () {
    Assert.throws(function () {
        var instance = new Server;
    }, 'Invalid configuration object.');
});

test(': Can be constructed with a config object.', function () {
    var instance = new Server(fixtures);
    Assert.ok(instance instanceof Server);
});

test(': Can start and stop the server.', function (done) {
    var instance = new Server(fixtures);
    process.once('server.started.*', function (port, ip) {
        Assert.equal(port, fixtures.servers[0].port);
        Assert.equal(ip, fixtures.servers[0].ip);

        process.once('server.stopped.*', function () {
            var socket = new net.Socket({type : 'tcp4'});
            socket.setTimeout(1);
            socket.on('error', function (err) {
                Assert.equal(err.code, 'ECONNREFUSED');
                done();
            });
            socket.connect(port, ip);
        });
        Assert.doesNotThrow(instance.stop);
    });
    Assert.doesNotThrow(instance.start);
});

test(': Can connect to the server and then stop it.', function (done) {
    var instance = new Server(fixtures);

    process.once('server.started.*', function (port, ip) {
        var socket = new net.Socket({type : 'tcp4'});
        socket.on('connect', function () {
            process.once('server.stopped.*', function () {
                done();
            });
            instance.stop();
        });
        socket.on('data', function (data) {
            Assert.equal(data.toString(), '** The server is shutting down.\n** You have been disconnected from the server.\n');
        });
        socket.connect(port, ip);
    });
    instance.start();
});
