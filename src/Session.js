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

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Status = require($HDR_DIR + '/Session').Status;
var I18n = require($SRC_DIR + '/I18n');

I18n.addPath($ROOT_DIR + '/msg', 'core');

/**
 * A connection manager.
 * @name Session
 * @param {net.Socket} socket
 */
var Session = function (socket) {
    var t;

    /**
     * The session id
     * @type {Number}
     */
    this.id = null;

    /**
     * The status of the session.
     * @type {Integer}
     * @getter
     */
    var status = Status.NEW;
    this.__defineGetter__('status', function () {
        return status;
    });

    this.disconnect = function () {
        setStatus(Status.DISCONNECTING);
        this.send(t('core.disconnect'), function () {
            socket.end();
        });
    };

    /**
     * Handles incoming data streams
     * @name handleData
     * @method
     * @private
     * @param {Buffer} data
     * @fires session.data.received
     */
    var handleData = function (data) {
        data = data.toString().trim();
        process.emit('session.data.received', this, data);
    };

    this.send = function (msg, cb) {
        socket.write(msg + '\n', cb);
    };

    /**
     * Sets the current session status.
     * @name setStatus
     * @method
     * @private
     * @param {Status.value} s
     * @fires session.status.changed
     */
    var setStatus = function (s) {
        status = s;
        process.emit('session.status.changed', this);
    };


    var shutdown = function () {
        this.send(t('core.shutdown'), this.disconnect.bind(this));
    };

    // @constructor
    {
        if (!socket)    throw new Error('Invalid socket object.');

        var timestamp = process.hrtime();
        this.id = util.format('%s.%s', timestamp[0], timestamp[1]);

        socket.on('close',  setStatus.bind(this, Status.DISCONNECTED));
        socket.on('login',  setStatus.bind(this, Status.CONNECTING));
        socket.on('data',   handleData.bind(this));

        process.once('server.server.closing', shutdown.bind(this));

        t = new I18n(DEFAULT_LANGUAGE);
    }
};

util.inherits(Session, EventEmitter);

module.exports = Session;