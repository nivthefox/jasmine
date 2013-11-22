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

suite('I18n');
require('../config.js');

var Assert = require('assert');
var I18n = require($SRC_DIR + '/I18n');
//var fixtures = require($ROOT_DIR + '/test/fixtures/Main');

test(': Can statically add a configuration path.', function () {
    Assert.doesNotThrow(function () { I18n.addPath($ROOT_DIR + '/test/fixtures/I18n', 'test') });
    Assert.deepEqual(I18n.getPaths(), [
        {namespace : 'core', path : $ROOT_DIR + '/msg'},
        {namespace : 'test', path : $ROOT_DIR + '/test/fixtures/I18n'}
    ]);
});

test(': Cannot add a bad path, or a work without a namespace, or re-use a namespace.', function () {
    Assert.throws(function () { I18n.addPath($ROOT_DIR + '/test/fixtures/I18n/noop') }, 'Invalid i18n path.');
    Assert.throws(function () { I18n.addPath($ROOT_DIR + '/test/fixtures/I18n') }, 'Invalid namespace.');
    Assert.throws(function () { I18n.addPath($ROOT_DIR + '/test/fixtures/I18n', 'test') }, 'Namespace already in use.');
});

test(': Can create a translate function', function () {
    var t = new I18n('en_US');
    Assert.equal(typeof t, 'function');
    Assert.equal(t('test.test'), 'This is a test.');
    Assert.equal(t('test.foo.bar', 'baz'), 'Bleep baz.');
});

test(': Translate works in multiple languages', function () {
    var t = new I18n('gib');
    Assert.equal(t('test.test'), '.tset a si sihT');
});

test(': Translate gracefully falls back for missing languages.', function () {
    var t = new I18n('noop');
    Assert.equal(t('test.test'), 'This is a test.');
});