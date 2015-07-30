'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const AbstractObject = require('jasmine/types/AbstractObject');

describe("jasmine.types.BaseObject", function () {
    const BaseObject = proxyquire('jasmine/types/BaseObject', {});

    it('should be instantiated as a child of AbstractObject', function () {
        let instance;

        assert.doesNotThrow(function () {
            instance = new BaseObject;
        });

        assert.instanceOf(instance, AbstractObject);
    });

    it('should be able to enter or leave another object', function () {
        let instance1 = new BaseObject;
        let instance2 = new BaseObject;
        let instance3 = new BaseObject;

        assert.doesNotThrow(function () {
            instance1.enter(instance2);
        });

        assert.equal(instance2.location, instance1);
        assert.ok(instance1.contents.has(instance2));
        assert.ok(!instance3.contents.has(instance2));

        assert.doesNotThrow(function () {
            instance3.enter(instance2);
        });

        assert.equal(instance2.location, instance3);
        assert.ok(!instance1.contents.has(instance2));
        assert.ok(instance3.contents.has(instance2));
    });
});
