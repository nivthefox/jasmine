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
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Server');
var Messages                            = require(BASE_PATH + '/src/Messages');
var Net                                 = require('net');
var Session                             = require(BASE_PATH + '/src/Session');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * The telnet server
 */
var Server = Class(function() {
    /**
     * Loads the options and messages, then creates a socket server.
     *
     * If the options are specified, it will override the options in game.yml;
     * this is useful for unit tests, but probably won't see production use.
     *
     * @param   {Object}        options     Options overrides.
     * @constructor
     */
    this.constructor = Public(function(options) {
        Log.debug('constructor');

        this.options                    = Util.extend(require(BASE_PATH + '/config/game.yml'), options);

        this.server                     = Net.createServer();
        this.server.on('connection', this.handleConnection);
        this.server.listen(this.options.port);
    });

    /**
     * Handles new socket connections.
     *
     * Incoming sockets are translated to the Socket wrapper (which assigns a
     * data handler) before they are sent the connect message.
     *
     * @param   {Net.Socket}    socket      The incoming socket.
     * @return  {undefined}
     */
    this.handleConnection = Protected(function(socket) {
        Log.debug('handleConnection');

        // Create the session object.
        var session                     = new Session(socket);

        // Acknowledge the connection.
        session.getSocket().emit('login');

        // Set the timeout.
        session.getSocket().setTimeout(this.options.timeout.connect);

        // Send the connect message to the session.
        // TODO: This is probably better put in the Messages class as a generic method like Messages.send(<session>, <message>, [,..., <arg-n>]).
        Messages.render('connect', this.options, this.renderHandler.bind(this, session));

        // Add the session to the list of available sessions.
        this.sessions.push(session);
    });

    /**
     * Sends rendered messages to a session.
     * @param   {Session}       session     The session to receive the message.
     * @param   {Error}         err         Errors from the renderer.
     * @param   {String}        out         Output from the renderer.
     * @return  {undefined}
     */
    this.renderHandler = Protected(function(session, err, out) {
        Log.debug('renderHandler', err, out);

        if (!err) {
            session.send(out);
        }
        else {
            Log.warn('renderHandler', err);
        }
    });


    this.options                        = Protected({});
    this.server                         = Protected({});
    this.sessions                       = Protected({});
});

module.exports                          = Server;