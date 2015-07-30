'use strict';

var assert = require('assert');
var proxyquire = require('proxyquire');

describe("jasmine.types.AbstractObject", function () {
    var AbstractObject = proxyquire('jasmine/types/AbstractObject', {});

    it('should not allow you to instantiate it directly', function () {
        assert.throws(function () {
            new AbstractObject;
        }, TypeError);
    });
});
