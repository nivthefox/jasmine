'use strict';

const assert = require('chai').assert;
const net = require('net');
const proxyquire = require('proxyquire');

const Mitm = require('mitm');

describe("jasmine.Session", function () {
    let mitm, serverSocket, clientSocket;
    const Session = proxyquire('jasmine/Session', {});

    before(function () {
        mitm = Mitm();
        mitm.on('connection', function (sock) {
            serverSocket = sock;
        });
    });

    beforeEach(function () {
        clientSocket = net.connect(1234, 'test.int');
    });

    afterEach(function () {
        clientSocket = undefined;
        serverSocket = undefined;
    });

    after(function () {
        mitm.disable();
    });

    it('should require a socket to instantiate', function () {
        let instance;

        assert.throws(function () {
            instance = new Session({});
        }, TypeError);

        instance = new Session(serverSocket);

        assert.instanceOf(instance, Session);
        assert.strictEqual(instance.socket, serverSocket);
    });

    it('should place input from a socket into an input buffer', function () {
        let instance = new Session(serverSocket);
        const expected = 'test command';

        clientSocket.write(expected + '\n');

        assert.equal(instance.buffer.length, 1);
        assert.equal(instance.buffer[0], expected);
    });

    it('should be able to send data to the socket', function (done) {
        let instance = new Session(serverSocket);
        const expected = 'test output';

        clientSocket.on('data', function (data) {
            data = data.toString('utf8');
            assert.equal(data, expected + '\n');
            done();
        });

        instance.send(expected);
    });
});
