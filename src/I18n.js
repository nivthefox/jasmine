/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * Copyright (C) 2013 Kevin Kragenbrink <kevin@writh.net>
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

require('js-yaml');
var fs = require('fs');
var util = require('util');

var namespaces = [];
var loaded = [];
var paths = [];
var languages = {};

var loadNamespace = function (namespace, lang) {
    if (languages[lang][namespace]) return;

    var path = paths.filter(function (path) {
        return (path.namespace === namespace);
    });

    if (path.length !== 1) {
        throw new Error('Could not load namespace' + namespace);
    }

    path = path[0].path;

    if (fs.existsSync(util.format('%s/%s.yml', path, lang))) {
        languages[lang][namespace] = require(util.format('%s/%s.yml', path, lang));
    }
    else {
        languages[lang][namespace] = require(util.format('%s/%s.yml', path, DEFAULT_LANGUAGE));
    }
};

var I18n = function (lang) {
    if (!languages[lang]) {
        languages[lang] = {};
    }

    return function () {
        var args = Array.prototype.slice.call(arguments);
        var message = args.shift().split('.');

        loadNamespace(message[0], lang);

        var msg = languages[lang];
        for (var i in message) {
            msg = msg[message[i]];
        }

        args.unshift(msg);
        return util.format.apply(util, args);
    }
};

I18n.getPaths = function () {
    return paths;
};

I18n.addPath = function (path, namespace) {
    if (!fs.existsSync(path) || !fs.existsSync(util.format('%s/%s.yml', path, DEFAULT_LANGUAGE))) {
        throw new Error('Invalid i18n path.');
    }

    if (!namespace) {
        throw new Error('Invalid namespace.');
    }

    if (namespaces.indexOf(namespace) >= 0) {
        throw new Error('Namespace already in use.');
    }

    namespaces.push(namespace);
    paths.push({namespace : namespace, path : path});
};

module.exports = I18n;