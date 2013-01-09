/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-07
 * @edited      2013-01-07
 * @package     JaSMINE
 * @see         https://github.com/Writh/jasmine
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

/** @ignore */
var Classical                           = require('classical');
var Config                              = require(BASE_PATH + '/src/Config')
var FileSystem                          = require('fs');

/**
 * Manages code modules.
 * @class
 */
var ModLoader = Class(function() {

    /**
     * Determines available modules to load.
     * @public
     * @method
     * @param   {String}        [path]
     */
    this.load = Public(function(path) {

        path                            = path || this.MOD_PATH;
        this.config                     = Config.getConfig('game', true);

        FileSystem.readDir(path, this.statAvailableMods.bind(this, path));
    });

    /**
     * Analyzes and possibly loads a mod.
     *
     * This will also merge the main configuration object with the module's 
     * default configuration to setup the mod.
     * 
     * @protected
     * @method
     * @param   {String}        mod
     * @param   {String}        path
     * @param   {Error|null}    err
     * @param   {Stats}         stats
     */
    this.analyzeMod = Protected(function(mod, path, err, stats) {
        if (stats.isDirectory() 
            && (this.config['mod'] && this.config['mod'][mod] && this.config['mod'][mod] !== FALSE)) {
                // Load mod here.
        }
    });

    /**
     * Iterates through the available mods and processes their stats.
     * @protected
     * @method
     * @param   {String}        path
     * @param   {Error|null}    err
     * @param   {String[]}      files
     */
    this.statAvailableMods = Protected(function(path, err, files) {
        for (var i in files) {
            path                        = path + '/' + files[i];
            FileSystem.stat(path, this.analyzeMod.bind(this, files[i], path));
        }
    });

    /**
     * The default mod path.
     * @type    {String}
     * @constant
     */
    this.MOD_PATH                       = BASE_PATH + '/mod';

    /**
     * The main game configuration object.
     * @tyype   {Config}
     */
    this.config                         = Protected({});

    /**
     * A list of loaded modules.
     * @type    {String[]}
     */
    this.modules                        = Protected([]);
});

module.exports                          = new ModLoader;