'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

describe('jasmine.Jasmine', function () {
    const Jasmine = proxyquire('jasmine/Jasmine', {});

    it('should instantiate', function () {
        let instance = new Jasmine;
        assert.instanceOf(instance, Jasmine);
    });
});
