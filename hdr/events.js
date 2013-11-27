// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var events = require('events');

events.EventEmitter.prototype.addListener = function(type, listener) {
    var len, m, v;

    if (typeof listener !== 'function')
        throw TypeError('listener must be a function');

    if (!this._events)
        this._events = {};

    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._events.newListener)
        this.emit('newListener', type, typeof listener.listener === 'function' ?
            listener.listener : listener);

    // Optimize Regular Expressions
    if (type instanceof RegExp) {
        if (!this._regevents) {
            this._regevents = [];
        }
        len = this._regevents.length;

        while (len--)
            if (String(this._regevents[len].regexp) === String(type)) {
                v = this._regevents[len]; break;
            }
        if (!v)
            v = {regexp : type};
        if (!v.listeners)
        // Optimize the case of one listener. Don't need the extra array object.
            v.listeners = listener;
        else if (typeof v.listeners === 'object')
        // If we've already got an array, just append.
            v.listeners.push(listener);
        else
        // Adding the second element, need to change to array.
            v.listeners = [v.listeners, listener];

        // Check for listener leak
        if (typeof v.listeners === 'object' && !v.listeners.warned) {
            m = this._maxListeners;
            if (m && m > 0 && v.listeners.length > m) {
                v.listeners.warned = true;
                console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    v.listeners.length);
                console.trace();
            }
        }

        if (len >= 0)
        // We're reusing an existing RegExp.
            this._regevents[len] = v;
        else
        // It's a new RegExp.
            this._regevents.push(v);
    }
    else {
        if (!this._events[type])
        // Optimize the case of one listener. Don't need the extra array object.
            this._events[type] = listener;
        else if (typeof this._events[type] === 'object')
        // If we've already got an array, just append.
            this._events[type].push(listener);
        else
        // Adding the second element, need to change to array.
            this._events[type] = [this._events[type], listener];

        // Check for listener leak
        if (typeof this._events[type] === 'object' && !this._events[type].warned) {
            m = this._maxListeners;
            if (m && m > 0 && this._events[type].length > m) {
                this._events[type].warned = true;
                console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
                console.trace();
            }
        }
    }

    return this;
};
events.EventEmitter.prototype.on = events.EventEmitter.prototype.addListener;
process.on = process.addListener = events.EventEmitter.prototype.addListener.bind(process);

events.EventEmitter.prototype.removeListener = function(type, listener) {
    var list, position, length, i;

    if (typeof listener !== 'function')
        throw TypeError('listener must be a function');

    if (type instanceof RegExp) {
        if (!this._regevents)
            return this;

        length = this._regevents.length;
        while (length--)
            if (String(this._regevents[length].regexp) === String(type)) {
                list = this._regevents[length]; break;
            }
        position = length;

        if (!list || !list.listeners)
            return this;

        if (list.listeners === listener ||
            (typeof list.listeners.listener === 'function' && list.listeners.listener === listener)) {
            this._regevents.splice(position, 1);
            if (this._events.removeListener)
                this.emit('removeListener', type, listener);
        } else if (typeof list.listeners === 'object') {
            length = list.listeners.length;
            while (length--) {
                if (list.listeners[length] === listener ||
                    (list.listeners[length].listener && list.listeners[length].listener === listener)) {
                    break;
                }
            }

            if (length < 0)
                return this;

            if (list.listeners.length === 1) {
                this._regevents.splice(position, 1);
            } else {
                list.listeners.splice(length, 1);
                if (list.listeners.length === 1) {
                    list.listeners = list.listeners[0];
                }
            }

            if (this._events.removeListener) {
                this.emit('removeListener', type, listener);
            }
        }
    }
    else {
        if (!this._events || !this._events[type])
            return this;

        list = this._events[type];
        length = list.length;
        position = -1;

        if (list === listener ||
            (typeof list.listener === 'function' && list.listener === listener)) {
            delete this._events[type];
            if (this._events.removeListener)
                this.emit('removeListener', type, listener);

        } else if (typeof list === 'object') {
            for (i = length; i-- > 0;) {
                if (list[i] === listener ||
                    (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }

            if (position < 0)
                return this;

            if (list.length === 1) {
                list.length = 0;
                delete this._events[type];
            } else {
                list.splice(position, 1);
            }

            if (this._events.removeListener)
                this.emit('removeListener', type, listener);
        }

    }

    return this;
};
process.removeListener = events.EventEmitter.prototype.removeListener.bind(process);

events.EventEmitter.prototype.emit = function(type) {
    var er, handler, len, args, i, listeners;

    if (!this._events)
        this._events = {};

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
        if (!this._events.error ||
            (typeof this._events.error === 'object' &&
                !this._events.error.length)) {
            er = arguments[1];
            if (this.domain) {
                if (!er) er = new TypeError('Uncaught, unspecified "error" event.');
                er.domainEmitter = this;
                er.domain = this.domain;
                er.domainThrown = false;
                this.domain.emit('error', er);
            } else if (er instanceof Error) {
                throw er; // Unhandled 'error' event
            } else {
                throw TypeError('Uncaught, unspecified "error" event.');
            }
            return false;
        }
    }

    handler = this._events[type];

    if (this._regevents) {
    // We have RegExp event listeners to test.
        len = this._regevents.length;
        while (len--) {
            if (this._regevents[len].regexp.test(type)) {
                if (!handler)
                    handler = this._regevents[len].listeners;
                else if (handler === 'function')
                    handler = [handler].concat(this._regevents[len].listeners);
                else
                    handler = handler.concat(this._regevents[len].listeners);
            }
        }
    }

    if (typeof handler === 'undefined')
        return false;

    if (this.domain && this !== process)
        this.domain.enter();

    if (typeof handler === 'function') {
        switch (arguments.length) {
            // fast cases
            case 1:
                handler.call(this);
                break;
            case 2:
                handler.call(this, arguments[1]);
                break;
            case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
            // slower
            default:
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++)
                    args[i - 1] = arguments[i];
                handler.apply(this, args);
        }
    } else if (typeof handler === 'object') {
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];

        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
            listeners[i].apply(this, args);
    }

    if (this.domain && this !== process)
        this.domain.exit();

    return true;
};

process.emit = events.EventEmitter.prototype.emit.bind(process);

module.exports = events;