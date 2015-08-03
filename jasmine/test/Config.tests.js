'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var yaml = require('js-yaml');

var Promise = require('bluebird');

//var MockPath = sinon.mock(path);
var MockFS = sinon.mock(Promise.promisifyAll(fs));
//var MockYaml = sinon.mock(yaml);

describe('jasmine.Config', function () {
    var Config = proxyquire('jasmine/Config', {
        'fs' : MockFS,
        'path' : path,
        'js-yaml' : yaml
    });

    it ('should require a valid configuration path', function () {
        assert.instanceOf(Config.load(), Error);

        var stub = sinon.stub(MockFS, 'existsSync');
            stub.returns(false);
        assert.instanceOf(Config.load('foo.yml'), Error);

        assert.ok(stub.calledOnce);
        MockFS.existsSync.restore();
    });

    it ('should attempt to load the file', function (done) {
        var exists = sinon.stub(MockFS, 'existsSync');
            exists.returns(true);

        var pending = Promise.pending();
        var read = sinon.stub(MockFS, 'readFileAsync');
            read.returns(pending.promise);

        var promise = Config.load('config/test.yml');

        assert.ok(exists.calledOnce);
        assert.ok(read.calledOnce);

        var load = sinon.stub(yaml, 'load');

        promise.then(function () {
            assert.ok(load.calledOnce);
            assert.equal(load.args[0][0], 'abc');

            MockFS.existsSync.restore();
            MockFS.readFileAsync.restore();
            yaml.load.restore();
            done();
        });
        pending.resolve('abc');
    });

    it ('should get a loaded value', function (done) {
        var exists = sinon.stub(MockFS, 'existsSync');
            exists.returns(true);
        var pending = Promise.pending();
        var read = sinon.stub(MockFS, 'readFileAsync');
        read.returns(pending.promise);

        var promise = Config.load('config/test.yml');
        var load = sinon.stub(yaml, 'load');
            load.returns({
                abc: 123
            });

        promise.then(function () {
            assert.equal(Config.get('abc'), 123);

            MockFS.existsSync.restore();
            MockFS.readFileAsync.restore();
            yaml.load.restore();
            done();
        });
        pending.resolve('abc:123');
    });
});