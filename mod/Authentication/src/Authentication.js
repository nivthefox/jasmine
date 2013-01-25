/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-23
 * @edited      2013-01-23
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
var Dust                                = require('dustjs-linkedin');
var Module                              = require(BASE_PATH + '/hdr/Module');
var Server                              = require(BASE_PATH + '/src/Server');

var Authentication = Implement(Module, function() {

    this.constructor = Public(function(config) {
        this.config                     = config;

        this.compileTemplates();

        process.on('server.session.connected', this.renderConnectScreen);
    });

    this.compileTemplates = Protected(function() {
        Dust.optimizers.format = function(ctx, node) { return node };

        for (var template in this.config.messages) {
            var compiled                = Dust.compile(this.config.messages[template], template);
            Dust.loadSource(compiled);
        }
        delete compiled;
    });

    this.renderConnectScreen = Protected(function(session) {
        Dust.render("Connect", {}, function(err, out) {
            session.send(out);
        });
    });

    this.config                         = Protected({});
});

module.exports                          = Authentication;
