'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const Config = require('jasmine/test/mock/Config');

describe('jasmine.Queue', function () {
    let owner = { send : function () {} };
    Config.config = { queue_speed: 1 };

    const Queue = proxyquire('jasmine/Queue', {
        'jasmine/Config' : Config
    });

    after(function () {
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
        let buffer = new Buffer('test');

        let queueLength = instance.queue.size;

        let pid = instance.queueRequest(owner, buffer);
        assert.equal(instance.queue.size, queueLength + 1);
        let pid2 = instance.queueRequest(owner, buffer);
        assert.equal(instance.queue.size, queueLength + 2);
        assert.strictEqual(pid + 1, pid2);
    });
});
