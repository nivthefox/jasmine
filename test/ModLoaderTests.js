/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-07
 * @edited      2013-01-16
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
var ModLoader                           = require(BASE_PATH + '/src/ModLoader');

suite('ModLoader');

test('Load', function() {
    loader                              = new ModLoader();
    ModLoader.load(BASE_PATH + '/test/fixtures/mod');

    Assert.ok(ModLoader.isLoaded('test1'));
    Assert.ok(ModLoader.isLoaded('test2'));
});

test('Unload', function() {
    ModLoader.unload();

    Assert.ifError(ModLoader.isLoaded('test1'));
    Assert.ifError(ModLoader.isLoaded('test2'));
});

test('Reload', function() {
    ModLoader.load(BASE_PATH + '/test/fixtures/mod');

    Assert.ok(ModLoader.isLoaded('test1'));
    Assert.ok(ModLoader.isLoaded('test2'));
});
