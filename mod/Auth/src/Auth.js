/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-23
 * @edited      2013-02-12
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
var Classical                           = require('classical');
var Dust                                = require('dustjs-linkedin');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Auth');
var Module                              = require(BASE_PATH + '/hdr/Module');
var Server                              = require(BASE_PATH + '/src/Server');

var User                                = require('../model/User');

/**
 * Adds support for character creation, login authentication, authorization, and a connect screen.
 *
 * @class Auth
 * @subpackage Modules
 */
var Auth = Implement(Module, function() {

    /**
     * Prepares templates and hooks.
     *
     * @name Auth#constructor
     * @public
     * @method
     * @param   {Object}        config
     */
    this.constructor = Public(function(config) {
        Log.debug('constructor');
        this.config                     = config;

        this.compileTemplates();

        User.count(this.createFirstUser);

        process.on('server.session.connected', this.renderConnectScreen);
    });

    /**
     * Compiles Dust templates.
     *
     * @name Auth#compileTemplates
     * @protected
     * @method
     */
    this.compileTemplates = Protected(function() {
        Log.debug('compileTemplates');
        Dust.optimizers.format = function(ctx, node) { return node };

        for (var template in this.config.messages) {
            var compiled                = Dust.compile(this.config.messages[template], 'Auth.' + template);
            Dust.loadSource(compiled);
        }
        delete compiled;
    });

    this.createFirstUser = Protected(function(err, count) {
        if (count === 0) {
            Log.debug('createFirstUser');
            var Owner                   = new User({name : 'Owner', password : 'jasmine'});
            Owner.save();
        }
    });

    /**
     * Renders the connect message to a newly created session.
     *
     * @name Auth#renderConnectScreen
     * @protected
     * @method
     * @param   {Session}       session
     */
    this.renderConnectScreen = Protected(function(session) {
        Log.debug('renderConnectScreen');
        Dust.render("Auth.Connect", {}, function(err, out) {
            session.send(out);
        });
    });

    /**
     * Stores the module configuration.
     *
     * @name Auth#config
     * @protected
     * @member
     * @type    {Object}
     */
    this.config                         = Protected({});
});

module.exports                          = Auth;
