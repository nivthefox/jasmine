/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-24
 * @edited      2013-01-04
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
var Command                             = require(BASE_PATH + '/hdr/Command');
var EventEmitter                        = require('events').EventEmitter;
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Interpreter');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * The definition of an interpreter list.
 * @struct
 */
var InterpreterList = function() {
    this.name                           = 'default';
    this.priority                       = 9999;
    this.test                           = function(session, phrase) { return true; };
    this.commands                       = [];
};

/**
 * The command interpreter.
 * @singleton
 */
var Interpreter = Extend(EventEmitter, function() {

    /**
     * Adds a command to an InterpreterList.
     * @param   {String}        name
     * @param   {Command}       command
     * @return  {undefined}
     */
    this.addCommand = Public(function(name, command) {
        Log.debug('addCommand');

        // Validate our command.
        var err                         = new TypeError('Attempted to add an invalid command.');
        try { var cmd = new command; }
        catch (e) { throw err; }
        // TODO: This section should work, but is presently failing. Likely 'Implement' is not maintaining the inheritance chain.
        // if (!(cmd instanceof Command)) { throw err; }

        var list                        = this.getListByName(name);
        list.commands.push(command);
        this.setListByName(name, list);
    });

    /**
     * Gets or configures a command list's priority and test.
     * @param   {String}        name
     * @param   {Integer}       [priority]
     * @param   {Function}      [test]
     * @return  {CommandList}
     */
    this.configure = Public(function(name, arg1, arg2) {
        Log.debug('configure');

        var list                        = null;

        // Loop through the current lists to see if any match.
        var list                        = this.getListByName(name);

        // Now that we have our list, it's time to prepare our configuration.
        var priority                    = Classical.type.INT(arg1) ? arg1 : Classical.type.INT(arg2) ? arg2 : list.priority;
        var test                        = Classical.type.FUNCTION(arg1) ? arg1 : Classical.type.FUNCTION(arg2) ? arg2 : list.test;

        // And assign.
        list.name                       = name;
        list.priority                   = priority;
        list.test                       = test;

        // Our list is ready.  Drop it back into place.
        this.setListByName(name, list);

        return list;
    });

    /**
     * Gets an InterpreterList from those available or else creates a new one.
     * @param   {String}        name
     * @return  {InterpreterList}
     */
    this.getListByName = Protected(function(name) {
        Log.debug('getListByName');

        var list                        = null;

        for (var i in this.lists) {
            if (this.lists.hasOwnProperty(i) && this.lists[i].name === name) {
                list                    = this.lists[i];
                break;
            }
        }

        // If we still have an empty list, then it's new.
        if (list === null) {
            var list                    = new InterpreterList;
        }

        return list;
    });

    /**
     * Adds an InterpreterList to the store and organizes by priority.
     * @param   {String}            name
     * @param   {InterpreterList}   list
     * @return  {undefined}
     */
    this.setListByName = Protected(function(name, list) {
        Log.debug('setListByName');

        var found                       = false;

        for (var i in this.lists) {
            if (this.lists.hasOwnProperty(i) && this.lists[i].name === name) {
                found                   = true;
                this.lists[i]           = list;
                break;
            }
        }

        if (found !== true) {
            this.lists.push(list);
        }

        this.lists.sort(this.sortByPriority);
    });

    /**
     * Attempts to interpret a provided phrase for a session.
     * @param   {Session}       session
     * @param   {String}        phrase
     * @param   {Function}      callback
     * @return  {undefined}
     */
    this.interpret = Public(function(session, phrase, callback) {
        Log.debug('interpret');

        var command                     = null;

        // Find the right command.
        for (var l in this.lists) {
            if (this.lists.hasOwnProperty(l) && this.lists[l].test(session, phrase)) {
                var list                = this.lists[l];
                for (var c in list.commands) {
                    if (list.commands.hasOwnProperty(c) && list.commands[c].expression.test(phrase)) {
                        command         = new list.commands[c];
                        break;
                    }
                }
            }
        }

        if (command === null) {
            this.emit('phrase.match.failure', session, phrase, callback);
        }
        else {
            this.emit('phrase.match.success', session, phrase, callback);
            command.run(session, phrase, callback);
        }
    });

    /**
     * Sorts a series of InterpreterLists by priority.
     * @param   {InterpreterList}   a
     * @param   {InterpreterList}   b
     * @return  {Integer}
     */
    this.sortByPriority = Protected(function(a, b) {
        Log.debug('sortByPriority');

        return a.priority - b.priority;
    });

    this.lists                          = Protected([]);
});

module.exports                          = new Interpreter;