'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

describe('jasmine.Util', function () {
    const Util = proxyquire('jasmine/Util', {});

    describe('getTimeLeft', function (done) {
        let called = false;
        let timeout = setTimeout(function () {
            assert.ok(called);
            done();
        }, 1000);

        assert.isBelow(Util.getTimeLeft(timeout), 1001);
        assert.isAbove(Util.getTimeLeft(timeout), 990);

        setTimeout(function () {
            assert.isAbove(Util.getTimeLeft(timeout), 400);
            assert.isBelow(Util.getTimeLeft(timeout), 500);
        }, 500);
    });
});
