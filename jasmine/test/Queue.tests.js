'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');
var sinon = require('sinon');

const Config = require('jasmine/test/mock/Config');
const TestCommand = require('jasmine/test/mock/commands/TestCommand');

describe('jasmine.Queue', function () {
    let owner = {
        at_command_not_found : function () {},
        commands : new Map(),
        send : function () {}
    };
    owner.commands.set('test', TestCommand);
    TestCommand.aliases.forEach(function (alias) {
        owner.commands.set(alias, TestCommand);
    });

    Config.config = { queue_speed: 1 };

    const Queue = proxyquire('jasmine/Queue', {
        'jasmine/Config' : Config
    });

    afterEach(function () {
        owner.at_command_not_found = function () {};
        Queue.instance.drain();
    });

    it('should be a singleton', function () {
        assert.throws(function () { new Queue; }, TypeError);

        let instance = Queue.instance;
        assert.instanceOf(instance, Queue);

        let instance2 = Queue.instance;
        assert.strictEqual(instance, instance2);
    });

    it('should allow you to queue an instruction', function () {
        let instance = Queue.instance;
        let buffer1 = new Buffer('test');
        let buffer2 = new Buffer('foo');

        let queueLength = instance.queue.size;

        let pid = instance.queueRequest(owner, buffer1);
        assert.equal(instance.queue.size, queueLength + 1);
        let pid2 = instance.queueRequest(owner, buffer2);
        assert.equal(instance.queue.size, queueLength + 2);
        assert.strictEqual(pid + 1, pid2);
    });

    it('should execute the command if it exists', function (done) {
        let instance = Queue.instance;
        let buffer1 = new Buffer('test command');
        let buffer2 = new Buffer('FOO'); // tests case insensitivity
        let queueLength = instance.queue.size;

        instance.queueRequest(owner, buffer1);
        assert.equal(instance.queue.size, queueLength + 1);
        instance.queueRequest(owner, buffer2);
        assert.equal(instance.queue.size, queueLength + 2);

        let called = 0;
        let expected = 2;
        process.on('executed TestCommand', function () {
            called++;

            if (called === expected) {
                process.removeAllListeners('executed TestCommand');
                done();
            }
        });
    });

    it('should correctly parse symbols as commands', function (done) {
        let instance = Queue.instance;
        let buffer1 = new Buffer(':test');
        let buffer2 = new Buffer('@test/bar');
        let buffer3 = new Buffer('"bar');
        let queueLength = instance.queue.size;

        instance.queueRequest(owner, buffer1);
        assert.equal(instance.queue.size, queueLength + 1);
        instance.queueRequest(owner, buffer2);
        assert.equal(instance.queue.size, queueLength + 2);
        instance.queueRequest(owner, buffer3);
        assert.equal(instance.queue.size, queueLength + 3);

        let called = 0;
        let expected = 3;
        process.on('executed TestCommand', function () {
            called++;

            if (called === expected) {
                process.removeAllListeners('executed TestCommand');
                done();
            }
        });
    });

    it('should call the command not found hook', function (done) {
        let instance = Queue.instance;
        let buffer = new Buffer('bar');
        owner.at_command_not_found = function (command) {
            assert.equal(command, 'bar');
            done();
        };
        instance.queueRequest(owner, buffer);
    });
});
