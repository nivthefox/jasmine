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
var log = require($SRC_DIR + '/Log').getLogger('Main');
var util = require('util');

/**
 * Initial entrypoint for the application.
 * @name Jasmine
 * @param {process} process
 * @param {Object} config
 * @param {Server} Server
 */
var Main = function (process, config, Server) {
    var server;

    /**
     * Shuts down the server and removes the PID file before exiting the process.
     * @name SIGTERM
     * @method
     * @private
     */
    var SIGTERM = function SIGTERM() {
        process.once('server.stopped.*', function () {
            fs.existsSync(config.pid) && fs.unlinkSync(config.pid);
            process.exit();
        });
        server.stop();
    };

    /**
     * Shuts down the server, then starts it back up, without terminating the node process.
     * @name SIGHUP
     * @method
     * @private
     */
    var SIGHUP = function SIGHUP() {
        process.once('server.stopped.*', this.restart);
    };

    this.restart = function () {
        // Destroy the server.
        server = null;

        // Invalidate require cache.
        var i = require.cache.length;
        while (i--) {
            delete require.cache[i];
        }

        // Start back up.
        this.start();
    };

    this.start = function () {
        if (server instanceof Server) {
            throw new Error('Server already started.');
        }

        fs.readdir($MOD_DIR, function (err, modules) {
            var i, module;
            for (i in modules) {
                module = modules[i];
                if (config.modules[module] === false) continue;
                require(util.format('%s/%s/module.js', $MOD_DIR, module));
            }

            process.once('server.started.*', function () {
                log.info('startup banner goes here.');
            });

            server = new Server(config);
            server.start();
        });
    };

    /**
     * @constructor
     */
    {
        if (!process)   throw new Error('Invalid process object');
        if (!config)    throw new Error('Invalid configuration object.');
        if (!Server || typeof Server !== 'function') throw new Error('Invalid Server class.');

        process.on('SIGTERM',   SIGTERM.bind(this));
        process.on('SIGHUP',    SIGHUP.bind(this));
    }
};

module.exports = Main;