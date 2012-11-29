/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-28
 * @edited      2012-11-28
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
var Tokenizer                           = require(BASE_PATH + '/src/Tokenizer');
var testTokenizer                       = null;

suite('Tokenizer');

test('Token', function() {
    var testToken                       = new Tokenizer.Token(123, 'test');

    Assert.ok(testToken instanceof Tokenizer.Token);
    Assert.equal(testToken.value, 123);
    Assert.equal(testToken.type, 'test');
});

test('Tokenize', function() {
    var rules = {
        'Repeat'                        : /^\s*(\d+x)/i,
        'Roll'                          : /^\s*(\d+d\d+)/i,
        'Subtract'                      : /^\s*(-)/i,
        'Add'                           : /^\s*(\+)/,
        'Number'                        : /^\s*(\d+)/i,
        'Comment'                       : /^\s*(\(.+?\))/,
        'Target'                        : /^\s*(>=|<=|<|>|=)/
    };

    testTokenizer                       = new Tokenizer(rules);
    testTokenizer.prepare('2x 3d8+2d6 +12 = 5');

    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Repeat', value: '2x'});
    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Roll', value: '3d8'});
    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Add', value: '+'});
    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Roll', value: '2d6'});
    Assert.equal(testTokenizer.getStream(), ' +12 = 5');
});

test('Flush Stream', function() {
    Assert.ok(testTokenizer.getStream().length > 0);
    testTokenizer.flush();
    Assert.ok(testTokenizer.getStream().length === 0);
});

test('Add rules', function() {
    testTokenizer.prepare('connect "moo goo" gaipan');

    testTokenizer.addRule('Connect', /^connect/i);
    testTokenizer.addRule('Username', /^(?:"(.+?)"|(\w+?))/);
    testTokenizer.addRule('Password', /^\w+/);
    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Connect', value: 'connect'});
    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Username', value: 'moo goo'});
    Assert.deepEqual(testTokenizer.getNextToken(), {type: 'Password', value: 'gaipan'});
});