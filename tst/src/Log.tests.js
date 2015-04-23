var assert = require('assert');
var path = require('path');
var proxyquire = require('proxyquire');

describe('src.Log', function () {

    var log4js = require('tst/mock/node_modules/log4js');

    var Log = proxyquire('src/Log', {
        'log4js' : log4js
    });

    var config = {
        app: {
            name: 'test'
        },
        log: {
            appenders: [{type: 'test.console'}],
            levels: {
                default: 'INFO'
            }
        }
    };

    it('configures log4js', function () {
        Log.configure(config);

        assert.ok(log4js.configure.called);
        assert.equal(Log.config.log.appenders[0].type, path.resolve(__dirname, '../../src/appenders/console'));
    });

    it('creates a logger with the default log level', function () {
        var log = Log.getLogger('test.src.Log');

        assert.equal(typeof log.info, 'function');
        assert.ok(log.setLevel.called);
        assert.ok(log.setLevel.args[0], config.log.levels.default);
    });

    it('creates a logger with specific log levels', function () {
        var log = Log.getLogger('test.src.Log2');

        assert.equal(typeof log.info, 'function');
        assert.ok(log.setLevel.called);
    });

    it('creates bunyan-style children', function () {
        var log = Log.getLogger('test.src.Log');
        var clog = log.child();

        assert.equal(typeof clog.info, 'function');
        assert.ok(clog.setLevel.called);
        assert.ok(clog.setLevel.args[0], config.log.levels.default);
    })
});


