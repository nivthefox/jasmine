/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-21
 * @edited      2012-11-21
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
var Dust                                = require('dustjs-linkedin');
var Net                                 = require('net');
var Util                                = require(BASE_PATH + '/src/Utilities');
var YAML                                = require('js-yaml');

var Messages                            = require(BASE_PATH + '/config/messages.yml');

/**
 * The telnet server
 */
var Server = Class(function() {
    this.options                        = Protected({});
    this.connecting                     = Protected([]);
    this.messages                       = Protected({});
    this.server                         = Protected({});

    this.constructor = Public(function(options) {
        this.options                    = Util.extend(require(BASE_PATH + '/config/game.yml'), options);

        for (var i in Messages) {
            this.messages[i]            = Dust.compile(Messages[i], i);
            Dust.loadSource(this.messages[i]);
        }

        this.server                     = Net.createServer();
        this.server.on('connection', this.handleConnection);
        this.server.listen(this.options.port);
    });

    this.handleConnection = Public(function(socket) {
        this.connecting.push(socket);

        Dust.render('connect', this.options, function(err, out) {
            socket.write(out);
        });
    });
});

module.exports                          = Server;