'use strict';

const assert = require('assert');
const proxyquire = require('proxyquire');

describe("jasmine.types.AbstractObject", function () {
    const AbstractObject = proxyquire('jasmine/types/AbstractObject', {});

    class TestObject extends AbstractObject {}

    it('should not allow you to instantiate it directly', function () {
        assert.throws(function () {
            new AbstractObject;
        }, TypeError);
    });

    it('should allow extending classes to be instantiated', function () {
        let instance;
        assert.doesNotThrow(function () {
            instance = new TestObject;
        });

        assert.equal(typeof instance.dbref, 'string');
    })
});
