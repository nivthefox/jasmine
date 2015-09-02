'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const TestAbstractObject = require('jasmine/test/mock/types/TestAbstractObject');

describe('jasmine.types.BaseObject', function () {
    const BaseObject = proxyquire('jasmine/types/BaseObject', {
        'jasmine/types/AbstractObject' : TestAbstractObject
    });

    it('should be instantiated as a child of AbstractObject', function () {
        let instance;

        assert.doesNotThrow(function () {
            instance = new BaseObject;
        });

        assert.instanceOf(instance, TestAbstractObject);
    });

    it('should be able to enter or leave another object', function () {
        let instance1 = new BaseObject;
        let instance2 = new BaseObject;
        let instance3 = new BaseObject;

        instance1.enter(instance2);
        assert.equal(instance2.location, instance1);
        assert.isAbove(instance1.contents.indexOf(instance2), -1);
        assert.equal(instance3.contents.indexOf(instance2), -1);

        instance3.enter(instance2);
        assert.equal(instance2.location, instance3);
        assert.equal(instance1.contents.indexOf(instance2), -1);
        assert.isAbove(instance3.contents.indexOf(instance2), -1);
    });
});
