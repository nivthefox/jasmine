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
 * @class       Auth
 * @subpackage  Auth
 */
var Auth = Implement(Module, function() {

    /**
     * Prepares templates and hooks.
     *
     * @name    Auth#constructor
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
     * @name    Auth#compileTemplates
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

    /**
     * Creates the 'Owner' account if it does not already exist.
     *
     * @name    Auth#createFirstUser
     * @protected
     * @method
     * @param   {Error}                 err
     * @param   {Integer}               count
     */
    this.createFirstUser = Protected(function(err, count) {
        if (count === 0) {
            Log.debug('createFirstUser');
            var Owner                   = new User({name : 'Owner', password : 'jasmine'});
            Owner.save();
            Log.warn('User \"Owner\" created with password \"jasmine\".');
        }
    });

    /**
     * Determines whether a session is at the login screen.
     *
     * @name    Auth#isAtLogin
     * @protected
     * @method
     * @param   {Session}               session
     * @return  {Boolean}
     */
    this.isAtLogin = Protected(function(session) {
        Log.debug('isAtLogin');
        return (session.getStatus() === Session.Status.CONNECTING);
    });

    /**
     * Determines whether a session has been authenticated.
     *
     * @name    Auth#hasAuth
     * @protected
     * @method
     * @param   {Session}               session
     * @return  {Boolean}
     */
    this.hasAuth = Protected(function(session) {
        Log.debug('isAuth');
        return (session.getStatus() === Session.Status.CONNECTED);
    });

    /**
     * Determines whether a session has been authenticated with admin permissions.
     * @name    Auth#isAuthAdmin
     * @protected
     * @method
     * @param   {Session}               session
     * @return  {Boolean}
     * @stub
     */
    this.isAuthAdmin = Protected(function(session) {
        Log.debug('isAuthAdmin');
        return false;
    });

    /**
     * Renders the connect message to any session at the login screen.
     *
     * @name    Auth#renderConnectScreen
     * @protected
     * @method
     * @param   {Session}       session
     */
    this.renderConnectScreen = Protected(function(session) {
        Log.debug('renderConnectScreen');

        if (this.isAtLogin(session)) {
            Dust.render("Auth.Connect", {}, function(err, out) {
                Controller.prepare('Send', session, out);
            });
        }
    });

    /**
     * Sets up all commands in the Auth module, and creates new command lists.
     *
     * @name    Auth#setupCommands
     * @protected
     * @method
     */
    this.setupCommands = Protected(function() {
        Log.debug('setupCommands');

        // Adding command lists to the Interpreter.
        Interpreter.configure('login',                              1,  this.isAtLogin);
        Interpreter.configure('auth',                               1,  this.isAuthAdmin);
        Interpreter.configure(Interpreter.DEFAULT_COMMAND_LIST,  9999,  this.hasAuth);

        // Adding all commands to the appropriate lists.
        var lists                       = ['auth', Interpreter.DEFAULT_COMMAND_LIST, 'login'];
        var list;
        while (list = lists.shift()) {
            // Map the default command list to the 'cmd' directory
            var directory               = (list === Interpreter.DEFAULT_COMMAND_LIST) ? 'cmd' : list;
            FS.readdir(Util.format('%s/%s', __dirname, directory), function(list, directory, err, files) {
                for (var i in files) {
                    var Command         = require(Util.format('%s/%s/%s', __dirname, directory, files[i]));
                    Interpreter.addCommand(list, Command);
                }
            }.bind(this, list, directory));
        }
    });

    /**
     * Sets up hooks to listen for the need to display the login screen.
     *
     * @name    Auth#setupHooks
     * @protected
     * @method
     */
    this.setupHooks = Protected(function() {
        Log.debug('setupHooks');

        process.on('session.status.changed',    this.renderConnectScreen);
    });

    /**
     * Sets up the User store.
     *
     * @name    Auth#setupUsers
     * @protected
     * @method
     */
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
