/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-04
 * @edited      2013-01-05
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

var FileSystem                          = require('fs');
global.BASE_PATH                        = FileSystem.realpathSync(__dirname + '/../');

/** @ignore */
var Classical                           = require('classical');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('jasmine');
var Server                              = require(BASE_PATH + '/src/Server');

/**
 * Starts up the server
 * @class
 */
var jasmine = Class(function() {

    this.constructor = Public(function() {
        Log.debug('constructor');

        process.on('SIGTERM',   this.sigTerm);
        process.on('SIGHUP',    this.sigHup);

        this.startup();
    });

    this.sigTerm = Public(function() {
        Log.debug('sigTerm');
        this.server.shutdown();

        if (FileSystem.existsSync(BASE_PATH + '/jasmine.pid')) {
            FileSystem.unlinkSync(BASE_PATH + '/jasmine.pid');
        }

        process.exit();
    });

    this.sigHup = Public(function() {
        Log.debug('sigHup');
        
        this.shutdown();
        this.startup();
    });

    this.shutdown = Protected(function() {
        if (this.server instanceof Server) {
            this.server.shutdown();
        }
    });

    this.startup = Protected(function() {
        Log.debug('startup');
        this.server                     = new Server;
    });

    this.server                         = Protected({});
});

new jasmine;