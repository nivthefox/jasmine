'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

describe('jasmine.Map', function () {
    const Map = proxyquire('jasmine/Map', {});

    it('should filter its contents into a new map', function () {
        let instance = new Map;
        instance.set('foo', true);
        instance.set('bar', false);
        instance.set('baz', true);
        instance.set('qux', false);
        let newInstance = instance.filter(function (v, k) {
            return (v || k === 'qux');
        });

        assert.strictEqual(newInstance.size, 3);
        assert.ok(newInstance.has('foo'), 'foo');
        assert.ok(newInstance.has('baz'), 'baz');
        assert.ok(newInstance.has('qux'), 'qux');
        assert.notOk(newInstance.has('bar'), 'bar');
    });
});