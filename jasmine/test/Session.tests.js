'use strict';

const assert = require('chai').assert;
const net = require('net');
const proxyquire = require('proxyquire');
const queue = require('jasmine/Queue').instance;

const AbstractCommand = require('jasmine/commands/AbstractCommand');
const Mitm = require('mitm');

class TestCommand extends AbstractCommand {
    static get command () { return 'test'; }
    static get aliases () { return ['foo']; }
    execute () {
        process.emit('executed TestCommand');
    }
}

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
    });

    it('should place input from a socket into an input buffer', function () {
        let instance = new Session(serverSocket);
        const expected = queue.queue.size + 1;
        clientSocket.write('test command\n');
        assert.equal(queue.queue.size, expected);
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

    it('should allow commands to be added', function () {
        let instance = new Session(serverSocket);
        let expected = instance.commands.size + 2;
        instance.addCommand(TestCommand);
        assert.strictEqual(instance.commands.size, expected);
    });

    it('should allow commands to be removed', function () {
        let instance = new Session(serverSocket);
        let expected = instance.commands.size;
        instance.addCommand(TestCommand);
        instance.removeCommand(TestCommand);
        assert.strictEqual(instance.commands.size, expected);
    });
});
