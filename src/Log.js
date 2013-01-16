/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2012-11-27
 * @edited      2012-11-27
 * @package     JaSMINE
 * @see         https://github.com/Writh/jasmine
 *
 * Copyright (C) 2012 Kevin Kragenbrink <kevin@writh.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/** @ignore */
var FileSystem                          = require('fs');
var Log                                 = require('log4js');
var Util                                = require(BASE_PATH +  '/src/Utilities');

var config                              = require(BASE_PATH + '/config/game.yml');

var logConfig = {
    appenders                           : [],
    levels                              : []
};

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    // Development mode.
    logConfig.appenders.push({type : 'console'});
}

if (process.env.NODE_ENV !== 'test') {
    var logDir                          = BASE_PATH + '/log/';

    // Production.
    if (!FileSystem.existsSync(logDir)) {
        FileSystem.mkdirSync(logDir, '0750');
    }
    logConfig.appenders.push({
        type                            : 'file',
        filename                        : Util.format('%s/%s', BASE_PATH, config.log.file),
        maxLogSize                      : (2 * 1024 * 1024),    // TODO: Magic number. This is the log size. 2M.
        backups                         : 10                    // TODO: Magic number. This is the number of times to rotate a log.
    });
}

Log.configure(logConfig);

module.exports                          = Log;
