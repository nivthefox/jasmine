/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-23
 * @edited      2013-02-22
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
var Controller                          = require(BASE_PATH + '/src/Controller');
var Dust                                = require('dustjs-linkedin');
var FS                                  = require('fs');
var Interpreter                         = require(BASE_PATH + '/src/Interpreter');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Auth');
var Module                              = require(BASE_PATH + '/hdr/Module');
var Server                              = require(BASE_PATH + '/src/Server');
var Session                             = require(BASE_PATH + '/src/Session');
var Util                                = require(BASE_PATH + '/src/Utilities');

var User                                = require('../model/User');

/**
 * Adds support for character creation, login authentication, authorization, and a connect screen.
 *
 * @class Auth
 * @subpackage Auth
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
        this.setupCommands();
        this.setupHooks();
        this.setupUsers();
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
        Dust.optimizers.format          = function(ctx, node) { return node };

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

    this.isAtLogin = Protected(function(session, phrase) {
        Log.debug('isAtLogin');
        return (session.getStatus() === Session.Status.CONNECTING);
    });

    this.isAuth = Protected(function(session, phrase) {
        Log.debug('isAuth');
        return (session.getStatus() === Session.Status.CONNECTED);
    });

    this.isAuthAdmin = Protected(function(session, phrase) {
        Log.debug('isAuthAdmin');
        return false;
    });

    /**
     * Renders the connect message to any session at the login screen.
     *
     * @name Auth#renderConnectScreen
     * @protected
     * @method
     * @param   {Session}       session
     */
    this.renderConnectScreen = Protected(function(session) {
        Log.debug('renderConnectScreen');

        if (this.isAtLogin(session)) {
            Dust.render("Auth.Connect", {}, function(err, out) {
                Controller.prepare('Emit', session, out);
            });
        }
    });

    this.setupCommands = Protected(function() {
        Log.debug('setupCommands');

        // Adding command lists to the Interpreter.
        Interpreter.configure('login',  1,  this.isAtLogin);
        Interpreter.configure('auth',   1,  this.isAuthAdmin);
        Interpreter.configure('cmd',    1,  this.isAuth);

        // Adding all commands to the appropriate lists.
        var lists                       = ['auth', 'cmd', 'login'];
        var list;
        while (list = lists.shift()) {
            FS.readdir(Util.format('%s/%s', __dirname, list), function(list, err, files) {
                for (var i in files) {
                    var Command         = require(Util.format('%s/%s/%s', __dirname, list, files[i]));
                    Interpreter.addCommand(list, Command);
                }
            }.bind(this, list));
        }
    });

    this.setupHooks = Protected(function() {
        Log.debug('setupHooks');

        process.on('session.status.changed',    this.renderConnectScreen);
    });

    this.setupUsers = Protected(function() {
        Log.debug('setupUsers');

        User.count(this.createFirstUser);
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
