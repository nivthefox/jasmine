/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-02-22
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
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Chat');
var Module                              = require(BASE_PATH + '/hdr/Module');
var Server                              = require(BASE_PATH + '/src/Server');
var Session                             = require(BASE_PATH + '/src/Session');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * Adds support for channels and communication.
 *
 * @class       Chat
 * @subpackage  Chat
 */
var Chat = Implement(Module, function() {

    /**
     * Prepares templates and hooks.
     *
     * @name    Chat#constructor
     * @public
     * @method
     * @param   {Object}                config
     */
    this.constructor = Public(function(config) {
        Log.debug('constructor');

        this.config                     = config;
        this.config.expression          = new RegExp(this.config.expression, 'i');
        this.compileTemplates();
        this.setupHooks();
    });

    /**
     * Compiles Dust templates.
     *
     * @name    Chat#compileTemplates
     * @protected
     * @method
     */
    this.compileTemplates = Protected(function() {
        Log.debug('compileTemplates');
        Dust.optimizers.format          = function(ctx, node) { return node };

        for (var template in this.config.messages) {
            Log.debug('Adding template Chat.' + template);
            var compiled                = Dust.compile(this.config.messages[template], 'Chat.' + template);
            Dust.loadSource(compiled);
        }
        delete compiled;
    });

    /**
     * Determines whether a suser is authorized to use the chat module.
     * @name    Chat#canChat
     * @protected
     * @method
     * @param   {Session}               session
     */
    this.canChat = Protected(function(session) {
        Log.debug('canChat');

        return (session.getStatus() === Session.Status.CONNECTED);
    });

    /**
     * Notifies the session that their phrase was unmatched.
     * @name    Chat#handleUnmatchedPhrase
     * @protected
     * @method
     * @param   {Session}               session
     * @param   {Function}              callback
     * @param   {Error}                 error
     * @param   {String}                message
     */
    this.handleUnmatchedPhrase = Protected(function(session, callback, err, message) {
        Log.debug('handleUnmatchedPhrase');

        Controller.prepare('Send', session, message);
        Controller.prepare('Synchronize', callback);
    });

    /**
     * Determines whether an unmatched command might be an attempt at using a channel.
     *
     * @name    Chat#isChannelAttempt
     * @protected
     * @method
     * @param   {String}                phrase
     * @return  {Boolean}
     */
    this.isChannelAttempt = Protected(function(phrase) {
        Log.debug('isChannelAttempt');

        return this.config.expression.test(phrase);
    });

    /**
     * Attempts to match the phrase to a channel before displaying a failure message.
     * @name    Chat#matchChannel
     * @protected
     * @method
     * @param   {Session}               session
     * @param   {String}                phrase
     * @param   {Function}              callback
     */
    this.matchChannel = Protected(function(session, phrase, callback) {
        Log.debug('matchChannel');

        if (this.canChat(session) &&  this.isChannelAttempt(phrase)) {
            var parts                   = this.config.expression.exec(phrase);

            var packet                  = {};
            packet.author               = session;
            packet.callback             = callback;
            packet.channel              = (parts[2] && parts[2].length > 0) ? parts[2].trim() : '';
            packet.command              = (parts[1].length > packet.channel.length) ? parts[1].substring(parts[1].indexOf(packet.channel) + packet.channel.length).trim() : 'say';
            packet.command              = packet.command.toLowerCase();
            packet.message              = parts[3].trim();

            var channelName             = null;
            if (packet.channel && packet.channel.length > 0) {
                for (var i in session.data.channels) {
                    if (session.data.channels[i].aliases.indexOf(packet.channel) > -1) {
                        channelName     = i;
                    }
                }
            }

            if (packet.channel && channelName !== null && session.data.channels[channelName].listening === true) {
                packet.channel          = channelName;
            }
            else if (packet.channel && packet.channel.length > 0) {
                Dust.render('Chat.Unmatched', {phrase: phrase}, this.handleUnmatchedPhrase.bind(this, session, callback));
                return;
            }

            Controller.prepare('Synchronize', this.prepareChannelMessage.bind(this, packet));
        }
        else {
            Dust.render('Chat.Unmatched', {phrase: phrase}, this.handleUnmatchedPhrase.bind(this, session, callback));
        }
    });

    /**
     *
     */
    this.prepareChannelMessage = Protected(function(packet) {
        Log.debug('prepareChannelMessage');

        var sessions                    = {};
        for (var i in Server.sessions) {
            if (this.filterSessions(packet, Server.sessions[i]) === true) {
                sessions[i]             = Server.sessions[i];
            }
        }

        var command                     = this.COMMAND_MAP[packet.command];
        Dust.render(command, packet, this.handleMessagePrepared.bind(this, sessions, packet));
    });

    this.handleMessagePrepared = Protected(function(sessions, packet, err, message) {
        Log.debug('handleMessagePrepared');
        for (var i in sessions) {
            Controller.prepare('Send', sessions[i], message);
        }
        Controller.prepare('Synchronize', packet.callback);
    });

    /**
     *
     */
    this.filterSessions = Protected(function(packet, session) {
        if (packet.channel && packet.channel.length > 0) {
            return (session.data.channels[packet.channel] && session.data.channels[packet.channel].listening === true);
        }
        else if (packet.author.data.location !== undefined) {
            return (packet.author.data.location === session.data.location);
        }
        else {
            // Locations aren't installed and it's not a channel.
            // Basically we have to treat the entire INE as a massive chat.
            return true;
        }
    });

    /**
     * Sets up the unmatched phrase hook.
     * @name    Chat#setupHooks
     * @protected
     * @method
     */
    this.setupHooks = Protected(function() {
        Log.debug('setupHooks');

        process.on('interpreter.phrase.unmatched',          this.matchChannel);
    });

    /**
     * Stores the module configuration.
     *
     * @name    Chat#config
     * @protected
     * @member
     * @type    {Object}
     */
    this.config                         = Protected({});

    this.COMMAND_MAP = Protected({
        '"'                             : 'Chat.Say',
        'say'                           : 'Chat.Say',
        ':'                             : 'Chat.Pose',
        'pose'                          : 'Chat.Pose',
        ';'                             : 'Chat.SemiPose',
        '@emit'                         : 'Chat.Emit',
        '\\'                            : 'Chat.Emit',
        '\\\\'                          : 'Chat.Emit'
    });
});

module.exports                          = Chat;
