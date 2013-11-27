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
function isUndefined(arg) {
    return arg === void 0;
}
util.isUndefined = isUndefined;
function isFunction(arg) {
    return typeof arg === 'function';
}
util.isFunction = isFunction;
function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}
util.isObject = isObject;

process.emit = function(type) {
    var er, handler, handles, len, matches, args, i, listeners, pattern, regReg;

    if (!this._events)
        this._events = {};

    // If there is no 'error' event listener then throw.
    if (type === 'error' && !this._events.error) {
        er = arguments[1];
        if (this.domain) {
            if (!er)
                er = new Error('Uncaught, unspecified "error" event.');
            er.domainEmitter = this;
            er.domain = this.domain;
            er.domainThrown = false;
            this.domain.emit('error', er);
        } else if (er instanceof Error) {
            throw er; // Unhandled 'error' event
        } else {
            throw Error('Uncaught, unspecified "error" event.');
        }
        return false;
    }

    handles = [];
    regReg = /^\/(.*)\/([gi]+)$/;
    for (i in this._events) {
        if (matches = regReg.exec(i)) {
            pattern = new RegExp(matches[1], matches[2]);
        } else {
            pattern = i.replace(/\./g, '\\.').replace(/\*/g, '.+');
            pattern = new RegExp('^' + pattern + '$');
        }

        if (pattern.test(type)) {
            handles.push(this._events[i]);
        }
    }
    handler = (handles.length === 1) ? handles[0] : handles;

    if (util.isUndefined(handler))
        return false;

    if (util.isFunction(handler)) {
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
    } else if (util.isObject(handler)) {
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];

        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
            listeners[i].apply(this, args);
    }

    return true;
};