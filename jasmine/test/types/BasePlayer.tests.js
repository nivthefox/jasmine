'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const BaseObject = require('jasmine/test/mock/types/TestAbstractObject');

describe('jasmine.types.BasePlayer', function () {
    const BasePlayer = proxyquire('jasmine/types/BasePlayer', {
        'jasmine/types/BaseObject' : BaseObject
    });

    it('should be instantiated as a child of BaseObject', function () {
        let instance;

        instance = new BasePlayer;
        assert.instanceOf(instance, BaseObject);
    });

    it('should allow setting passwords, but not getting them', function () {
        let instance;

        instance = new BasePlayer;
        instance.password = 'test';
        assert.equal(instance.password, undefined);
    });

    it('should allow you to check for password matches', function () {
        let instance;

        instance = new BasePlayer;
        instance.password = 'test';
        assert.notOk(instance.checkPassword('foo'));
        assert.ok(instance.checkPassword('test'));
    });
});
