'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');

describe('src.Database', function () {
    var Database = proxyquire('jasmine/Database', {});

    it ('should serve as a factory', function () {
        let instance1 = Database.getInstance('test', 'test');
        let instance2 = Database.getInstance('test', 'test');
        let instance3 = Database.getInstance('test', 'test2');

        assert.instanceOf(instance1, Database);
        assert.instanceOf(instance2, Database);
        assert.instanceOf(instance3, Database);
        assert.strictEqual(instance1, instance2);
        assert.notStrictEqual(instance1, instance3);
    });

    it ('should retrieve collections', function () {
        let collection = Database.getCollection('game', 'db', 'collection');
        let joe = {name: 'joe', age: 42};
        let jack = {name: 'jack', age: 32};
        collection.insert(joe);
        collection.insert(jack);

        let result = collection.find({age: {$gt: 35}});
        assert.equal(result.length, 1);
        assert.equal(result[0].name, 'joe');

        jack.age = 37;
        collection.update(jack);

        result = collection.find({age: {$gt: 35}});
        assert.equal(result.length, 2);
        assert.equal(result[0].name, 'jack');
        assert.equal(result[1].name, 'joe');
    });
});