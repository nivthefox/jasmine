/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-24
 * @edited      2012-12-24
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

var Classical                           = require('classical');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Interpreter');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * The definition of an interpreter list.
 * @struct
 */
var InterpreterList = {
    name                                : 'default',
    priority                            : 9999,
    test                                : function(session, phrase) { return true; },
    commands                            : []
};

/**
 * The command interpreter.
 * @singleton
 */
var Interpreter = Class(function() {

    /**
     * Configures a command list's priority and test.
     * @param   {String}        name
     * @param   {Integer}       [priority]
     * @param   {Function}      [test]
     * @return  {CommandList}
     */
    this.configure = Public(function(name, arg1, arg2) {
        Log.debug('configure');

        var list                        = null;

        // Loop through the current lists to see if any match.
        for (var i in this.lists) {
            if (this.lists.hasOwnProperty(i) && this.lists[i].name === name) {
                list                    = this.lists[i];
                break;
            }
        }

        // If we still have an empty list, then it's new.
        if (list === null) {
            list                        = Util.extend({}, InterpreterList);
        }

        // Now that we have our list, it's time to prepare our configuration.
        var priority                    = Classical.type.INT(arg1) ? arg1 : Classical.type.INT(arg2) ? arg2 : list.priority;
        var test                        = Classical.type.FUNCTION(arg1) ? arg1 : Classical.type.FUNCTION(arg2) ? arg2 : list.test;

        // And assign.
        list.priority                   = priority;
        list.test                       = test;

        return list;
    });

    this.lists                          = Protected([]);
});

module.exports                          = new Interpreter;