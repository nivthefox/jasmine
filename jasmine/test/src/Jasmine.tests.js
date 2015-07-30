'use strict';

var assert = require('assert');
var proxyquire = require('proxyquire');

describe("src.Jasmine", function () {
    var Jasmine = proxyquire('jasmine/src/Jasmine', {});
});
