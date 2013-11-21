
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

var fs = require('fs');

/**
 * Initial entrypoint for the application.
 * @name Jasmine
 * @param {process} process
 * @param {Object} config
 */
var Main = function (process, config) {

    /**
     * Shuts down the server and removes the PID file before exiting the process.
     * @name SIGTERM
     * @method
     * @private
     */
    var SIGTERM = function SIGTERM() {
        fs.existsSync(config.pid) && fs.unlinkSync(config.pid);
        process.exit();
    };

    /**
     * Shuts down the server, then starts it back up, without terminating the node process.
     * @name SIGHUP
     * @method
     * @private
     */
    var SIGHUP = function SIGHUP() {
    };

    /**
     * @constructor
     */
    {
        if (!process)   throw new Error('Invalid process object');
        if (!config)    throw new Error('Invalid configuration object.');

        process.on('SIGTERM',   SIGTERM);
        process.on('SIGHUP',    SIGHUP);
    }
};

module.exports = Main;