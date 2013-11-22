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

suite('Session');
require('../config.js');

var Assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var Session = require($SRC_DIR + '/Session');
var SessionHdrs = require($HDR_DIR + '/Session');
//var fixtures = require($ROOT_DIR + '/test/fixtures/Session');
var socket;

beforeEach(function () {
    socket = new EventEmitter;
});

test(': Cannot be constructed without a socket', function () {
    Assert.throws(function () {
        instance = new Session;
    }, 'Invalid socket object.');
});

test(': Can be constructed and is an EventEmitter.', function () {
    var instance = new Session(socket);
    Assert.ok(instance instanceof Session);
    Assert.ok(instance instanceof EventEmitter);
});

test(': Has an ID and a Status. Status changes as expected.', function () {
    var instance = new Session(socket);
    Assert.ok(/\d+\.\d+/.test(instance.id));
    Assert.equal(instance.status, SessionHdrs.Status.NEW);
    socket.emit('login');
    Assert.equal(instance.status, SessionHdrs.Status.CONNECTING);
    socket.emit('close');
    Assert.equal(instance.status, SessionHdrs.Status.DISCONNECTED);
});

test(': Can handle incoming data streams.', function (done) {
    var instance = new Session(socket);
    process.on('session.data.received', function (data) {
        Assert.equal(data, 'test');
        done();
    });

    socket.emit('data', 'test');
});
