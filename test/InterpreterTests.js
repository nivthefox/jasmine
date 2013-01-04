/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-12-24
 * @edited      2013-01-04
 * @package     JaSMINE
 * @see         https://github.com/Writh/jasmine
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

require('./setup');
var Assert                              = require('assert');
var Interpreter                         = require(BASE_PATH + '/src/Interpreter');
var Net                                 = require('net');
var Session                             = require(BASE_PATH + '/src/Session');

var sess                                = null;
var cmds 								= require('./fixtures/commands');

suite('Interpreter');

test('Configure', function() {
    var test = function(session, phrase) {
        return session.getStatus() === Session.Status.CONNECTED;
    };
    var tl                              = Interpreter.configure('test', 10, test);

    Assert.equal(tl.priority, 10);
    Assert.equal(tl.commands.length, 0);
    Assert.strictEqual(tl.test, test);
});

test('Add Commands', function() {
	var err;
	
	Interpreter.addCommand('test', cmds.Arith);
	try {
		Interpreter.addCommand('test', null);
	}
	catch (e) { err = e; }
	finally {
		Assert.ok(err instanceof TypeError);
		Assert.equal(err.message, 'Attempted to add an invalid command.');
	}

	var tl 								= Interpreter.configure('test');
	Assert.equal(tl.commands.length, 1);
});

test('Run Commands', function(done) {
	var socket                          = new Net.Socket;
    sess                                = new Session(socket);
    var success 						= false;

    Interpreter.on('phrase.match.failure', function(session, phrase, callback) {
    	Assert.equal(phrase, 'arith 1 + 1');
    	callback('caught failure');
    });

    Interpreter.on('phrase.match.success', function(session, phrase, callback) {
    	success 						= true;
    });

    Interpreter.interpret(sess, 'arith 1 + 1', function(f) {
    	Assert.equal(f, 'caught failure');
    });

    sess.setStatus(Session.Status.CONNECTED);

    Interpreter.interpret(sess, 'arith 1 + 1', function(f) {
    	Assert.equal(f, '1 + 1');
    	Assert.ok(success);
    	done();
    });
});