'use strict';

const net = require('net');

class Session {
    constructor (socket) {
        if (!(socket instanceof net.Socket)) {
            throw new TypeError('socket must be an instance of net.Socket');
        }

        this._socket = socket;
        this._inputBuffer = [];

        this._socket.on('data', this.processInput.bind(this));
    }

    get buffer () {
        return this._inputBuffer;
    }

    get socket () {
        return this._socket;
    }

    processInput (input) {
        this._inputBuffer = input
            .split('\n')
            .filter(function (command) {
                return command.length > 0;
            })
            .reduce(function (collection, item) {
                collection.push(item);
                return collection;
            }, this._inputBuffer);
    }
}

module.exports = Session;