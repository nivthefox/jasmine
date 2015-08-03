'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');
const util = require('util');

describe('jasmine.Database', function () {
    var Database = proxyquire('jasmine/Database', {});

    afterEach(function () {
        Database.__wipe();
    });

    it ('should always give a unique dbref', function () {
        let instance1 = new Database;
        let instance2 = new Database;

        assert.typeOf(instance1.dbref, 'number');
        assert.typeOf(instance2.dbref, 'number');
        assert.notEqual(instance1.dbref, instance2.dbref);
    });

    it ('should allow you to load existing objects by dbref', function () {
        let instance1 = new Database;
            instance1.name = 'test';

        let instance2 = Database.load(instance1.dbref);
        assert.strictEqual(instance1, instance2);
    });

    it ('should be able to search the database', function () {
        var instance1 = new Database();
        var instance2 = new Database();
        var instance3 = new Database();
        var instance4 = new Database();

        instance1.name = 'Foo';
        instance2.name = 'Bar';
        instance3.name = 'Baz';
        instance4.name = 'Qux';

        var dbs = Database.find({'name' : 'Foo'});
        assert.ok(util.isArray(dbs));
        assert.equal(dbs.length, 1);
        assert.ok(dbs[0] instanceof Database);
        assert.strictEqual(dbs[0], instance1);

        dbs = Database.find({'name' : {'$in' : ['Bar', 'Baz', 'Moo']}});
        assert.ok(util.isArray(dbs));
        assert.equal(dbs.length, 2);
        assert.strictEqual(dbs[0], instance2);
        assert.strictEqual(dbs[1], instance3);

        dbs = Database.find({'dbref' : {'$lt' : 2}});
        assert.ok(util.isArray(dbs));
        assert.equal(dbs.length, 2);
        assert.strictEqual(dbs[0], instance1);
        assert.strictEqual(dbs[1], instance2);

        dbs = Database.find({'dbref' : {'$lte' : 2}});
        assert.ok(util.isArray(dbs));
        assert.equal(dbs.length, 3);
        assert.strictEqual(dbs[0], instance1);
        assert.strictEqual(dbs[1], instance2);
        assert.strictEqual(dbs[2], instance3);

        dbs = Database.find({'dbref' : {'$gt' : 2}});
        assert.ok(util.isArray(dbs));
        assert.equal(dbs.length, 1);
        assert.strictEqual(dbs[0], instance4);

        dbs = Database.find({'dbref' : {'$gte' : 2}});
        assert.ok(util.isArray(dbs));
        assert.equal(dbs.length, 2);
        assert.strictEqual(dbs[0], instance3);
        assert.strictEqual(dbs[1], instance4);
    });
});