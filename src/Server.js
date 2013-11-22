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

var net = require('net');
var log = require($SRC_DIR + '/Log').getLogger('Server');
var Session = require($SRC_DIR + '/Session');

/**
 * A telnet server.
 * @name Server
 * @param {Object} config
 */
var Server = function (config) {
    /**
     * The net server instance.
     * @type {net.Server}
     */
    var server;

    /**
     * Current server connections.
     * @type {Array}
     */
    var sessions = [];

    /**
     * Handles new connections.
     * @name handleConnection
     * @method
     * @private
     * @param {net.Socket} socket
     * @fires server.session.connected
     */
    var handleConnection = function (socket) {
        var session = new Session(socket);
        sessions.push(session);
    };

    /**
     * Creates a server instructs it to listen for connections.
     * @name start
     * @method
     * @public
     * @fires server.net.listening
     */
    this.start = function () {

        server = net.createServer();

        server.on('connection', handleConnection);

        for (var i in config.servers) {
            var port = config.servers[i].port;
            var ip = config.servers[i].ip || '0.0.0.0';

        }
        server.listen(port, ip, function (port, ip) {

            process.emit('server.listening.netserver', port, ip);
            log.info('Listening on %s port %d.', ip, port);
        }.bind(this, port, ip));
    };

    /**
     * Instructs the server to stop listening and stop when all sessions have ended.
     * @name stop
     * @method
     * @public
     * @fires server.closing.server
     * @fires server.closed.server
     */
    this.stop = function () {
        process.emit('server.closing.netserver');
        server.removeListener('connection', handleConnection);

        server.close(function () {
            process.emit('server.closed.netserver');
        });
    };

    /**
     * @constructor
     */
    {
        if (!config)    throw new Error('Invalid configuration object.');
    }
};

module.exports = Server;