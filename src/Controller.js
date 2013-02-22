/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-18
 * @edited      2013-02-22
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

/** @ignore */
var Classical                           = require('classical');
var FS                                  = require('fs');
var Instruction                         = require(BASE_PATH + '/hdr/Instruction');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Controller');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * Manages internal instructions.
 *
 * @class Controller
 * @singleton
 */
var Controller = Class(function() {

    /**
     * Initializes the base instruction sets.
     */
    this.constructor = Public(function() {
        Log.debug('constructor');

        FS.readdir(BASE_PATH + '/src/Instruction', function(err, files) {
            for (var i in files) {
                var file                = files[i];
                var name                    = file.match(/(.+?)\.js$/)[1];
                var instruction             = require(Util.format('%s/src/Instruction/%s', BASE_PATH, file));
                this.define(name, instruction);
            }
        }.bind(this));
    });

    /**
     * Defines a new instruction which can be used in Instruction Sets.
     *
     * @name Controller#define
     * @public
     * @method
     * @param   {String}        name
     * @param   {Class}         instruction
     */
    this.define = Public(function(name, instruction) {
        Log.debug('define');

        if (this.instructions[name] !== undefined) {
            throw new Error('Instruction name address collision.  An instruction by that name is already defined.');
        }

        // TODO: This section should work, but is presently failing. Likely 'Implement' is not maintaining the inheritance chain.
//        if (!(new instruction instanceof Instruction)) {
//            throw new Error('Attempted to define non-Instruction as an Instruction.');
//        }

        this.instructions[name]         = instruction;
    });

    /**
     * Prepares an instruction for later processing.
     *
     * @name Controller#prepare
     * @public
     * @method
     * @param   {String}        name
     * @param   {*}             [...]
     * @return  {Instruction}
     */
    this.prepare = Public(function() {
        Log.debug('prepare');

        var args                        = Array.prototype.slice.call(arguments);
        var name                        = args.shift();

        if (this.instructions[name] === undefined) {
            throw new Error('Attempted to prepare invalid instruction.');
        }

        var instruction                 = new this.instructions[name];
        instruction.initialize.apply(instruction, args);
        return instruction;
    });

    /**
     * The collection of available instructions.
     *
     * @name Controller#instructions
     * @private
     * @member
     * @type    {Object}
     */
    this.instructions                   = Private({});
});

module.exports                          = new Controller;
