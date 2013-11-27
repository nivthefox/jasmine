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

suite('Main');
require('../config.js');

var Assert = require('assert');
var Main = require($SRC_DIR + '/Main');
var events = require($HDR_DIR + '/events');
var fixtures = require($ROOT_DIR + '/test/fixtures/Main');

test(': Cannot be constructed without process object.', function () {
    Assert.throws(function () {
        var instance = new Main();
    }, 'Invalid process object.');
});

test(': Cannot be constructed without config object.', function () {
    Assert.throws(function () {
        var instance = new Main(process);
    }, 'Invalid configuration object.');
});

test(': Cannot be constructed without Server class.', function () {
    Assert.throws(function () {
        var instance = new Main(process, fixtures);
    }, 'Invalid Server class.');
});

test(': Can be constructed with config and process object.', function () {
    var instance = new Main(process, fixtures, function () {});
    Assert.ok(instance instanceof Main);
});

test(': Successfully unlinks the pidfile before shutting down.', function (done) {
    var fs = require('fs');

    var proc = new events.EventEmitter;
    proc.exit = function () {
        Assert.ok(!fs.existsSync(fixtures.pid));
        done();
    };

    var server = function () {};
    server.prototype.start = function () {
        proc.emit('server:started:test')
    };
    server.prototype.stop = function () {
        proc.emit('server:stopped:test')
    };

    fs.writeFileSync(fixtures.pid, '1234');
    Assert.ok(fs.existsSync(fixtures.pid));
    var instance = new Main(proc, fixtures, server);
    instance.start();
    proc.on('server:started:test', function () {
        proc.emit('SIGTERM');
    });
});

