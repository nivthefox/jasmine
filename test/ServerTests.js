/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-20
 * @edited      2013-01-23
 * @package     JaSMINE
 * @see         https://github.com/Writh/jasmine
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

require('./setup');
var Assert                              = require('assert');
var Net                                 = require('net');
var Server                              = require(BASE_PATH + '/src/Server');
var srv                                 = null;
var client                              = new Net.Socket({type : 'tcp4'});
var config                              = require('./fixtures/gameConfig.js');

suite('Server');

test('Create', function() {
    srv                                 = new Server(config);

    Assert.ok(srv instanceof Server);
});

test('Connect', function(done) {
    var connected                       = false;
    var received                        = false;

    client.on('connect', function() {
        connected                       = true;
        Assert.ok(true);
    });

    process.once('server.session.connected', function(session) {
        session.send('Welcome to test.');
    });

    client.on('data', function(data) {
        received                        = true;
        Assert.equal(data.toString(), "Welcome to test.\n");
    });

    setTimeout(function() {
        Assert.ok(connected);
        Assert.ok(received);
        done();
    }, 10);

    client.connect(config.port);
});

test('Shutdown', function(done) {
    process.on('server.net.shutdown', function() {
        done();
    });

    srv.shutdown();
});
