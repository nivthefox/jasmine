/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-10
 * @edited      2012-12-10
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
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('Parser');
var Tokenizer                           = require(BASE_PATH + '/src/Tokenizer');
var Util                                = require(BASE_PATH + '/src/Utilities');

/**
 * Stores data about a rule.
 * @type {Object}
 * @struct
 */
var Rule = function() {
    this.name                           = null;
    this.expression                     = null;
    this.priority                       = null;
    this.handler                        = null;
};

/**
 * Converts a string into a series of tokens and types.
 */
var Parser = Class(function() {

    /**
     * Adds a rule to the list of definitions.
     * @param   {Rule}      rule
     * @return  {undefined}
     */
    this.addRule = Public(function(rule) {
        Log.debug('addRule');

        if (this.validateRule(rule)) {
            this.rules.push(rule);
            this.rules.sort(this.prioritySort);
            this.prepareTokenizer();
        }
        else {
            Log.error('addRule', 'Invalid rule.');
        }
    });

    /**
     * Returns the named parser.
     *
     * If the named parser does not exist, it will be created.
     *
     * @param   {String}        name
     * @param   {Integer}       [priority=1]
     * @param   {Function}      [test=function() {return true;}]
     * @return  {Parser}
     */
    this.getParser = Static(Public(function(name, priority, test) {
        Log.debug('getParser');

        for (var i in this.parsers) {
            if (this.parsers.hasOwnProperty(i) && this.parsers[i].name == name) {
                return this.parsers[i].parser;
            }
        }

        var newParser = {
            name                        : name,
            priority                    : (Classical.type.INT(priority) ? priority : 1),
            test                        : (Classical.type.FUNCTION(test) ? test : function() { return true; }),
            parser                      : new Parser
        };

        this.parsers.push(newParser);
        this.parsers.sort(this.prioritySort);

        return newParser.parser;
    }));

    /**
     * Returns the current rules.
     * @return  {Rule[]}
     */
    this.getRules = Public(function() {
        Log.debug('getRule');

        return this.rules;
    });

    /**
     * Parses a phrase into tokens using the currently defined rules.
     * @param   {String}    phrase
     * @return  {undefined}
     */
    this.parse = Public(function(phrase) {
        Log.debug('parse');

        this.tokenizer.prepare(phrase);

        var token;
        while (token != Tokenizer.EOSTOKEN) {
            token                       = this.tokenizer.getNextToken();
            Log.debug('parse', 'type =', token.type);

            if (token != Tokenizer.EOSTOKEN) {
                this.stack.push(token);
            }
        }

        this.reduce();
    });

    /**
     * Injects the rules into the Tokenizer.
     * @return  {undefined}
     */
    this.prepareTokenizer = Protected(function() {
        Log.debug('prepareTokenizer');

        if (this.tokenizer instanceof Tokenizer) {
            delete this.tokenizer;
        }

        this.tokenizer                  = new Tokenizer;

        for (var i in this.rules) {
            if (this.rules.hasOwnProperty(i)) {
                this.tokenizer.addRule(this.rules[i].name, this.rules[i].expression);
            }
        }
    });

    /**
     * Sorts an array of objects by priority, lowest to highest.
     */
    this.prioritySort = Protected(function(a, b) {
        return (a.priority - b.priority);
    });

    /**
     * Reduces the current stack recursively right to left.
     * @return  {undefined}
     */
    this.reduce = Protected(function() {
        if (this.stack.length > 0) {
            var token               = this.stack.pop();

            for (var i in this.rules) {
                if (this.rules.hasOwnProperty(i) && token.type == this.rules[i].name) {
                    this.rules[i].handler.call(this, token.value);
                }
            }

            this.reduce();
        }
    });

    /**
     * Validates that a rule is fully formed and usable.
     * @param   {Rule}      rule
     * @return  {Bool}
     */
    this.validateRule = Protected(function(rule) {
        Log.debug('validateRule');

        if (!(rule instanceof Rule)) {
            return false;
        }

        if (!Classical.type.STRING(rule.name)) {
            return false;
        }

        if (!(rule.expression instanceof RegExp)) {
            return false;
        }

        if (!Classical.type.FLOAT(rule.priority)) {
            return false;
        }

        if (!Classical.type.FUNCTION(rule.handler)) {
            return false;
        }

        return true;
    });

    this.parsers                        = Static(Public([]));
    this.rules                          = Protected([]);
    this.stack                          = Protected([]);
    this.tokenizer                      = Protected({});
});

module.exports                          = Parser;
module.exports.Rule                     = Rule;