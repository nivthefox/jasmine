'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

const BaseObject = require('jasmine/test/mock/types/TestAbstractObject');

describe("jasmine.types.BasePlayer", function () {
    const BasePlayer = proxyquire('jasmine/types/BasePlayer', {
        'jasmine/types/BaseObject' : BaseObject
    });

    it('should be instantiated as a child of BaseObject', function () {
        let instance;

        assert.doesNotThrow(function () {
            instance = new BasePlayer;
        });

        assert.instanceOf(instance, BaseObject);
    });
});
