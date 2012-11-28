/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-21
 * @edited      2012-11-27
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
 * DEALINGS IN THE SOFTWARE.
 */

var Classical                           = require('classical');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Session');
var Net                                 = require('net');

/**
 * An enum of available statuses.
 * @type {Object}
 * @enum
 */
var Status = {
    NEW                                 : 0,
    CONNECTING                          : 1,
    CONNECTED                           : 2,
    DISCONNECTED                        : 4,
    TIMEDOUT                            : 8
};

/**
 * A socket wrapper class.
 */
var Session = Class(function() {
    this.socket                         = Protected({});
    this.status                         = Protected(Status.NEW);

    /**
     * Instantiates the Session and stores the socket.
     *
     * @param   {Net.Socket}        socket     The socket to wrap.
     * @constructor
     */
    this.constructor = Public(function(socket) {
        Log.debug('constructor');

        this.socket                     = socket;

        this.socket.on('close',     function() { this.status = Status.DISCONNECTED; }.bind(this));
        this.socket.on('login',     function() { this.status = Status.CONNECTING;   }.bind(this));
        this.socket.on('timeout',   function() { this.status = Status.TIMEDOUT;     }.bind(this));
    });

    /**
     * Retrieves the underlying socket.
     */
    this.getSocket = Public(function() {
        Log.debug('getSocket');

        return this.socket;
    });

    /**
     * Returns the current status of the socket.
     * @return      {Status:value}
     */
    this.getStatus = Public(function() {
        Log.debug('getStatus');

        return this.status;
    });

    /**
     * Sends a message along the socket.
     */
    this.send = Public(function(message) {
        Log.debug('send', message);

        this.socket.write(message);
    });
});

module.exports                          = Session;
module.exports.Status                   = Status;