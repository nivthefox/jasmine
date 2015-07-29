'use strict';

var log = require('log4js');
var path = require('path');

var Log = {};
Log.config = {};

Log.configure = function (config) {
    Log.config = config;

    Log.config.log.appenders.forEach(function (appender) {
        if (new RegExp('^' + Log.config.app.name + '\\.').test(appender.type)) {
            appender.type = path.resolve(__dirname,
                appender.type.replace(Log.config.app.name + '.', 'appenders/'));
        }
    });

    log.configure(Log.config.log);

    Object.keys(loggers).forEach(function (name) {
        loggers[name].setLevel(Log.config.log.levels[name] || Log.config.log.levels['default']);
    });
};

var loggers = {};

// Levels don't get properly used by the configure method, so we need to overwrite them.
Log.getLogger = function (name) {
    var logger = log.getLogger(name, Log.config);

    // Mimic bunyan functionality
    logger.child = function (options) {
        var cname = name;
        if (options) {
            cname += JSON.stringify(options);
        }
        return Log.getLogger(cname);
    };

    if (Log.config && Log.config.log && Log.config.log.levels) {
        logger.setLevel(Log.config.log.levels[name] || Log.config.log.levels['default']);
    }
    loggers[name] = logger;
    logger.configure = Log.configure;

    return logger;
};

module.exports                          = Log;
