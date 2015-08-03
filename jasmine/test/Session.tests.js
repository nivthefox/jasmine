'use strict';

const assert = require('chai').assert;
const net = require('net');
const proxyquire = require('proxyquire');

describe("jasmine.Session", function () {
    var Session = proxyquire('jasmine/Session', {});

    it('should require a socket to instantiate', function () {
        let instance;

        assert.throws(function () {
            instance = new Session({});
        }, TypeError);

        let socket = new net.Socket;
        instance = new Session(socket);

        assert.instanceOf(instance, Session);
        assert.instanceOf(instance.socket, net.Socket);
        assert.strictEqual(instance.socket, socket);
    });

    it('should place input from a socket into an input buffer', function () {
        let socket = new net.Socket;
        let instance = new Session(socket);
        const expected = 'test command';

        socket.emit('data', expected + '\n');
        assert.equal(instance.buffer.length, 1);
        assert.equal(instance.buffer[0], expected);
    });
});
