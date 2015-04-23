var assert = require('assert');
var proxyquire = require('proxyquire');

describe("src.Jasmine", function () {
    var Jazmine = proxyquire('src/Jasmine', {});

    it('should require a valid configuration path', function () {
        assert.throws(function () { var jasmine = new Jazmine; });
    });
});