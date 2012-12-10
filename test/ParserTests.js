/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-10
 * @edited      2012-12-10
 * @package     Nodem
 * @see         https://github.com/Writh/nodem
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
var Handlers                            = require('./fixtures/parserHandlers.js');
var Parser                              = require(BASE_PATH + '/src/Parser');
var testParser                          = null;

suite('Parser');

test('Setup', function() {
    testParser                          = new Parser;
    Assert.ok(testParser instanceof Parser);


    var string                          = new Parser.Rule;
    string.name                         = 'string';
    string.expression                   = /^\s*(?:"(.+?)"|(\S+))/;
    string.priority                     = 10;
    string.handler                      = Handlers.string;
    testParser.addRule(string);

    var connect                         = new Parser.Rule;
    connect.name                        = 'connect';
    connect.expression                  = /^(connect)/i;
    connect.priority                    = 0;
    connect.handler                     = Handlers.connect;
    testParser.addRule(connect);

    Assert.equal(testParser.getRules().length, 2);
});

test('Parse', function(done) {
    process.once('parserTest.connect', function(obj) {
        Assert.deepEqual(obj, {username : 'test user', password : 'test'});
        done();
    });
    testParser.parse('connect "test user" test');
});