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

/** @ignore */
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

    /**
     * Adds signal handling and then calls startup.
     * 
     * @name jasmine#constructor
     * @public
     * @method
     */
    this.constructor = Public(function() {
        Log.debug('constructor');

        process.on('SIGTERM',   this.sigTerm);
        process.on('SIGHUP',    this.sigHup);

        this.startup();
    });

    /**
     * Shuts down the server and removes the pid file before exiting the process.
     *
     * @name jasmine#sigTerm
     * @protected
     * @method
     */
    this.sigTerm = Protected(function() {
        Log.debug('sigTerm');
        this.server.shutdown();

        if (FileSystem.existsSync(BASE_PATH + '/jasmine.pid')) {
            FileSystem.unlinkSync(BASE_PATH + '/jasmine.pid');
        }

        process.exit();
    });

    /**
     * Shuts down the server, then starts it back up, without terminating the node process.
     *
     * @name jasmine#sigHup
     * @protected
     * @method
     */
    this.sigHup = Protected(function() {
        Log.debug('sigHup');
        
        // TODO: Calling shutdown will kill all active sessions, which is undesireable.  It would be beneficial to 
        //          instead PAUSE the connections, unload plugins and reload them, then re-establish the connections.
        this.shutdown();
        // TOOD: It would probably be beneficial to unload the plugins, here, and reload them; allowing a soft "code update".
        this.startup();
    });

    /**
     * Calls the server shutdown process.
     *
     * @name jasmine#shutdown
     * @public
     * @method
     */
    this.shutdown = Public(function() {
        Log.debug('shutdown');

        if (this.server instanceof Server) {
            this.server.shutdown();
        }
    });

    /**
     * Creates a new instance of the Server class.
     *
     * @name jasmine#startup
     * @public
     * @method
     */
    this.startup = Public(function() {
        Log.debug('startup');
        this.server                     = new Server;
    });

    /**
     * The currently active Server.
     *
     * @name jasmine#server
     * @protected
     * @member
     * @type    {Server}
     */
    this.server                         = Protected({});
});

new jasmine;