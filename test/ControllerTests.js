/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-18
 * @edited      2012-12-18
 * @package     JaSMINE
 * @see         https://github.com/Writh/jasmine
 *
 * Copyright (C) 2012 Kevin Kragenbrink <kevin@writh.net>
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
var Controller                          = require(BASE_PATH + '/src/Controller');
var Instruction                         = require('./fixtures/instruction');

suite('Controller');
test('Define', function() {
// console.log('=====><=====');
    try {
        Controller.define('AddOne', Instruction);
    }
    catch (e) {
        Assert.ok(false, e);
    }

    // TODO: @see Controller:define for notes on why this fails.
//    var caught1 = false;
//    try {
//        Controller.define('test2', Assert);
//    }
//    catch (e) {
//        caught1 = true;
//    }
//    finally {
//        Assert.ok(caught1, 'Added an invalid instruction.');
//    }

    var caught2 = false;
    try {
        Controller.define('AddOne', Instruction);
    }
    catch (e) {
        caught2 = true;
    }
    finally {
        Assert.ok(caught2, 'Added an instruction twice.');
    }
});

test('Invoke', function(done) {
    process.once('controller.invoke', function(data, callback) {
        Assert.equal(data, 2);
        callback(data + 1);
    });

    Controller.prepare('AddOne', 1, function(data) {
        Assert.equal(data, 3);
        done();
    });
});
