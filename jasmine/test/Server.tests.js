'use strict';

const assert = require('chai').assert;
const net = require('net');
const proxyquire = require('proxyquire').noCallThru();

const Mitm = require('jasmine/test/mock/node_modules/net');
const Session = require('jasmine/Session');

describe('jasmine.Server', function () {
    const Server = proxyquire('jasmine/Server', {
        'net' : Mitm,
        'game/Session' : Session
    });

    let config = {
        port : 1234,
        address: '0.0.0.0'
    };

    it('should accept connections and turn them into sessions', function (done) {
        let instance = new Server(config);
        instance.start();

        assert.ok(Mitm.server.listen.calledOnce);

        assert.equal(0, instance.sessions.length);
        let client = net.connect(config.port, '127.0.0.1');

        client.on('connect', function () {
            assert.equal(1, instance.sessions.length);
            assert.instanceOf(instance.sessions[0], Session);

            instance.stop();
            assert.ok(Mitm.server.close.calledOnce);

            done();
        });
    });
});
