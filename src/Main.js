/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-20
 * @edited      2012-11-20
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
var FileSystem                          = require('fs');

/**
 * Nodem base class.
 */
var Main = Class(function() {
    this.constructor = Public(function() {
        console.log('Main.constructor');

        // Assign the base path to be used in require throughout the system.
        global.BASE_PATH                = FileSystem.realpathSync(__dirname + '/../');

        // Set up process hooks.
        process.on('SIGHUP',    this.reload);
        process.on('SIGTERM',   this.shutdown);

        // TODO:
        //      Remove this; it's just here to keep the process running until
        //      there is a server to start.
        setInterval(function() {}, 1000);
    });

    /**
     * Reloads the server without stopping it.
     * Useful for configuration file changes.
     */
    this.reload = Private(function() {
        console.log('Main.restart');
    });

    /**
     * Gracefully shuts down the server.
     */
    this.shutdown = Private(function() {
        console.log('Main.shutdown');

        process.exit();
    });
});

new Main;