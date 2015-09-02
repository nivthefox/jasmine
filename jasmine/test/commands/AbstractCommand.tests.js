'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');
const TestCommand = require('jasmine/test/mock/commands/TestCommand');

describe('jasmine.commands.AbstractCommand', function () {
    const AbstractCommand = proxyquire('jasmine/commands/AbstractCommand', {});

    it('should not allow you to instantiate it directly', function () {
        assert.throws(function () {
            new AbstractCommand;
        }, TypeError);
    });

    it('should allow extending classes to be instantiated', function () {
        let instance;
        let caller = {};
        let switches = 'foo/bar/baz';
        let args = 'foo bar baz';
        assert.doesNotThrow(function () {
            instance = new TestCommand(caller, switches, args);
        });

        assert.strictEqual(instance.caller, caller);
        assert.deepEqual(instance.switches, switches.split('/'));
        assert.deepEqual(instance.args, args.split(' '));
    });
});
