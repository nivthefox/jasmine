/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-21
 * @edited      2012-11-21
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
 * DEALINGS IN THE SOFTWARE.I
 */

var Classical                           = require('classical');
var Util                                = require('util');

/**
 * Common utility methods.
 */
var Utilities = Extend(Util, function() {

    /**
     * Extends an object with any other objects, overwriting variables along the way.
     *
     * The first argument becomes the 'base'; additional arguments will be used to
     * overwrite or extend the base object.  This is very basic inheritence.
     *
     * @param   {Object...}     arguments   The objects to extend.
     * @return  {Object}
     */
    this.extend = Public(function() {
        var args                                = Array.prototype.slice.call(arguments);
        var target                              = args.shift();
            target                              = target || {};
        var source;

        while (source = args.shift()) {
            if (typeof source == 'object' && (Object.prototype.toString.call(source) == '[object Object]' || Object.prototype.toString.call(source) == '[object Array]')) {
                for (var i in source) {
                    if (source.hasOwnProperty(i)) {
                        target[i]               = target[i] || ((Object.prototype.toString.call(source[i]) == '[object Array]') ? [] : {});
                        target[i]               = arguments.callee(target[i], source[i]);
                    }
                }
            }
            else {
                target                          = source;
            }
        }

        return target;
    });
});

module.exports                          = new Utilities;