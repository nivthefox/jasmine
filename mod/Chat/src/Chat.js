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
var Session                             = require(BASE_PATH + '/src/Session');

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
        return this.CHANNEL_EXPRESSION.test(phrase);
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
            var parts                   = this.CHANNEL_EXPRESSION.exec(phrase);

            var channel                 = parts[1].length > 0 ? parts[1].trim() : null;
            var command                 = parts[2].trim();
            var message                 = parts[3].trim();
        }
        else {
            Dust.render('Chat.Unmatched', {phrase: phrase}, this.handleUnmatchedPhrase.bind(this, session, callback));
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

    /**
     * Matches attempts to use channels.
     * @name    Chat#CHANNEL_EXPRESSION
     * @protected
     * @member
     * @const
     * @type    {RegExp}
     */
    this.CHANNEL_EXPRESSION             = Protected(/^(\w+ )?(say |pose |@emit |[":;\|\\]|\\\\)?(.*)/i);
});

module.exports                          = Chat;
