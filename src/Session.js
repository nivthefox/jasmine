/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-21
 * @edited      2012-12-12
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
var EventEmitter                        = require('events' ).EventEmitter;
var Interpreter                         = require(BASE_PATH + '/src/Interpreter');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Session');
var Net                                 = require('net');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * An enum of available statuses.
 * @memberof Session
 * @enum {Integer}
 */
var Status = {
    NEW                                 : 0,
    CONNECTING                          : 1,
    CONNECTED                           : 2,
    DISCONNECTED                        : 3,
    TIMEDOUT                            : 4
};

/**
 * A socket wrapper class.
 * @class
 */
var Session = Extend(EventEmitter, function() {

    /**
     * Instantiates the Session and stores the socket.
     *
     * @name Session#constructor
     * @public
     * @method
     * @param   {Net.Socket}        socket
     */
    this.constructor = Public(function(socket) {
        Log.debug('constructor');

        var timestamp                   = process.hrtime();
        this.id                         = Util.format('%s.%s', timestamp[0], timestamp[1]);
        this.socket                     = socket;
        this.socket.on('close',         this.setStatus.bind(this, Status.DISCONNECTED));
        this.socket.on('login',         this.setStatus.bind(this, Status.CONNECTING));
        this.socket.on('timeout',       this.setStatus.bind(this, Status.TIMEDOUT));
        this.socket.on('data',          this.handleData.bind(this, this.__classical_public));
    });

    this.getId = Public(function() {
        Log.debug('getId');

        return this.id;
    });

    /**
     * Retrieves the underlying socket.
     *
     * @name Session#getSocket
     * @public
     * @method
     */
    this.getSocket = Public(function() {
        Log.debug('getSocket');

        return this.socket;
    });

    /**
     * Returns the current status of the socket.
     *
     * @name Session#getStatus
     * @public
     * @method
     * @return  {Status}
     */
    this.getStatus = Public(function() {
        Log.debug('getStatus');

        return this.status;
    });

    this.handleData = Public(function(session, data) {
        Log.debug('handleData');

        var data                        = data.toString();

        Interpreter.interpret(session, data, function() {});
    });

    /**
     * Sends a message along the socket.
     *
     * @name Session#send
     * @public
     * @method
     */
    this.send = Public(function(message) {
        Log.debug('send', message);

        this.socket.write(message);
    });

    /**
     * Sets the current session status.
     * @param   {Status:value}      status
     * @return  {undefined}
     */
    this.setStatus = Public(function(status) {
        this.status                     = status;
    });

    this.id                             = Protected(null);
    this.socket                         = Protected({});
    this.status                         = Protected(Status.NEW);
});

module.exports                          = Session;
module.exports.Status                   = Status;
