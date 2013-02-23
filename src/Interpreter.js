/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-24
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

/** @ignore */
var Classical                           = require('classical');
var Command                             = require(BASE_PATH + '/hdr/Command');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Interpreter');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * The command interpreter.
 *
 * @class
 * @singleton
 */
var Interpreter = Class(function() {

    /**
     * Adds a command to an CommandList.
     *
     * @name Interpreter#addCommand
     * @public
     * @method
     * @param   {String}        name
     * @param   {Command}       command
     */
    this.addCommand = Public(function(name, command) {
        Log.debug('addCommand');

        if (typeof name !== 'string') {
            command                     = name;
            name                        = this.DEFAULT_COMMAND_LIST;
        }

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
     *
     * @name Interpreter#configure
     * @public
     * @method
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
     * Gets an CommandList from those available or else creates a new one.
     *
     * @name Interpreter#getListByName
     * @protected
     * @method
     * @param   {String}        name
     * @return  {CommandList}
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
            var list                    = new CommandList;
        }

        return list;
    });

    /**
     * Adds an CommandList to the store and organizes by priority.
     *
     * @name Interpreter#setListByname
     * @protected
     * @method
     * @param   {String}            name
     * @param   {CommandList}   list
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
     *
     * @name Interpreter#interpret
     * @public
     * @method
     * @param   {Session}       session
     * @param   {String}        phrase
     * @param   {Function}      callback
     * @fires   Interpreter#interpreter&period;phrase&period;unmatched
     * @fires   Interpreter#interpreter&period;phrase&period;matched
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
            Log.debug('Could not match phrase');
            /**
             * The interpreter was unable to match a phrase to a command.
             *
             * @event Interpreter#interpreter&period;phrase&period;unmatched
             * @property {Session}  session
             * @property {String}   phrase
             * @property {Function} callback
             */
            process.emit('interpreter.phrase.unmatched', session, phrase, callback);
        }
        else {
            Log.debug('Successfully matched phrase');
            /**
             * The interpreter successfully matched a phrase to a command.
             *
             * @event Interpreter#interpreter&period;phrase&period;matched
             * @property {Session}  session
             * @property {String}   phrase
             * @property {Function} callback
             */
            process.emit('interpreter.phrase.matched', session, phrase, callback);
            command.run(session, phrase, callback);
        }
    });

    /**
     * Sorts a series of CommandLists by priority.
     *
     * @name Interpreter#setByPriority
     * @protected
     * @method
     * @param   {CommandList}   a
     * @param   {CommandList}   b
     * @return  {Integer}
     */
    this.sortByPriority = Protected(function(a, b) {
        Log.debug('sortByPriority');

        return a.priority - b.priority;
    });


    /**
     * The collection of command lists.
     *
     * @name Interpreter#lists
     * @protected
     * @member
     * @type {CommandList[]}
     */
    this.lists                          = Protected([]);

    /**
     * The default command list name.
     *
     * @name    Interpreter#DEFAULT_COMMAND_LIST
     * @public
     * @static
     * @member
     * @const
     * @type    {String}
     */
    this.DEFAULT_COMMAND_LIST           = Static(Public('cmd'));
});


/**
 * The definition of an interpreter list.
 * @name CommandList
 * @memberof Interpreter
 * @class
 * @struct
 */
var CommandList = function() {
    /**
     * The Name of the command list
     * @name CommandList#name
     * @type {String}
     */
    this.name                           = Interpreter.DEFAULT_COMMAND_LIST;

    /**
     * The priority of the command list
     * @name CommandList#priority
     * @type {Integer}
     */
    this.priority                       = 9999;

    /**
     * The test to determine whether the command list should be searched.
     * @name CommandList#test
     * @type {Function}
     * @param   {Session}   session
     * @param   {String}    phrase
     * @return  {Boolean}
     */
    this.test                           = function(session, phrase) { return true; };

    /**
     * The list of commands.
     * @name CommandList#commands
     * @type {Command[]}
     */
    this.commands                       = [];
};

module.exports                          = new Interpreter;
