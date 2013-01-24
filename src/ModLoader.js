/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-01-07
<* @edited      2013-01-23
=* @package     JaSMINE
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
var FileSystem                          = require('fs');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('ModLoader');
var Util                                = require(BASE_PATH + '/src/Utilities');
var Module                              = require(BASE_PATH + '/hdr/Module');

var config                              = require(BASE_PATH + '/config/game.yml');

/**
 * Manages code modules.
 * @class
 */
var ModLoader = Class(function() {

    /**
     * Determines available modules to load.
     * @public
     * @method
     * @name ModLoader#load
     * @param   {String}        [path]
     */
    this.load = Public(function(path) {
        Log.debug('load');

        path                            = path || this.MOD_PATH;
        FileSystem.readdir(path, this.statAvailableMods.bind(this, path));
    });

    /**
     * Analyzes and possibly loads a mod.
     *
     * This will also merge the main configuration object with the module's
     * default configuration to setup the mod.
     *
     * @protected
     * @method
     * @name ModLoader#analyzeMod
     * @param   {String}        mod
     * @param   {String}        path
     * @param   {Error|null}    err
     * @param   {Stats}         stats
     * @fires   ModLoader#modloader&period;module&period;loaded
     * @fires   ModLoader#modloader&period;module&period;failed
     */
    this.analyzeMod = Protected(function(mod, path, err, stats) {
        Log.debug('analyzeMod');

        if (stats && stats.isDirectory()) {
            try {
                var mergedConfig        = Util.extend(require(Util.format('%s/config/game.yml', path)), config);

                // Abort if it's disabled.
                if (mergedConfig['mod'] && mergedConfig['mod'][mod] && mergedConfig['mod'][mod] === false) {
                    throw new Error('disabled')
                    return;
                }

                var ModClass            = require(Util.format('%s/src/%s', path, mod));
                var modConfig           = (mergedConfig['mod'] && mergedConfig['mod'][mod]) ? mergedConfig['mod'][mod] : {};
                var instance            = new ModClass(modConfig);

                this.modules[mod]       = instance;

                /**
                 * Notify that the module has been loaded
                 *
                 * @event ModLoader#modloader&period;module&period;loaded
                 * @property    {String}    mod
                 */
                process.emit('modloader.module.loaded', mod);
                Log.info('Loaded %s module', mod);
            }
            catch (e) {

                /**
                 * Notify that the module has failed to load
                 *
                 * @event ModLoader#modloader&period;module&period;failed
                 * @property    {String}    mod
                 */
                process.emit('modloader.module.failed', mod);
            }
        }
        else {
            /**
             * Notify that the module has failed to load
             *
             * @event ModLoader#modloader&period;module&period;failed
             * @property    {String}    mod
             */
            process.emit('modloader.module.failed', mod);
        }
    });

    /**
     * Reports whether a mod has been loaded.
     * @public
     * @method
     * @name ModLoader#isLoaded
     * @param   {String}    mod
     */
    this.isLoaded = Public(function(mod) {
        Log.debug('isLoaded');

        // This is disabled because instanceof is not working with interfaces, right now.
        // return (this.modules[mod] instanceof Module);
        return (typeof this.modules[mod] !== 'undefined');
    });

    /**
     * Iterates through the available mods and processes their stats.
     * @protected
     * @method
     * @name ModLoader#statAvailableMods
     * @param   {String}        path
     * @param   {Error|null}    err
     * @param   {String[]}      files
     */
    this.statAvailableMods = Protected(function(path, err, files) {
        Log.debug('statAvailableMods');

        var loaded                      = [];
        var failed                      = [];

        process.on('modloader.module.loaded', this.handleLoaded.bind(this, files, loaded, failed));
        process.on('modloader.module.failed', this.handleFailed.bind(this, files, loaded, failed));

        for (var i in files) {
            var modpath                 = path + '/' + files[i];
            FileSystem.stat(path, this.analyzeMod.bind(this, files[i], modpath));
        }
    });

    /**
     * Records a module's successful load
     * @protected
     * @method
     * @name ModLoader#handleLoaded
     * @param   {String[]}      files
     * @param   {String[]}      loaded
     * @param   {String[]}      failed
     * @param   {String}        mod
     * @fires   ModLoader#modloader&period;load&period;complete
     */
    this.handleLoaded = Protected(function(files, loaded, failed, mod) {
        Log.debug('handleLoaded', mod);
        loaded.push(mod);

        if (loaded.length + failed.length == files.length) {
            /**
             * Notify that modloading is complete.
             *
             * @event ModLoader#modloader&period;load&period;complete
             * @property    {String[]}  loaded
             * @property    {String[]}  failed
             */
            process.emit('modloader.load.complete', loaded.length, failed.length);
            process.removeListener('modloader.module.loaded', this.handleLoaded);
            process.removeListener('modloader.module.failed', this.handleFailed);

            Log.info('%d modules loaded, %d modules failed.', loaded.length, failed.length);
        }
    });

    /**
     * Records a module's failure to load.
     * @protected
     * @method
     * @name ModLoader#handleFailed
     * @param   {String[]}      files
     * @param   {String[]}      loaded
     * @param   {String[]}      failed
     * @param   {String}        mod
     * @fires   ModLoader#modloader&period;load&period;complete
     */
    this.handleFailed = Protected(function(files, loaded, failed, mod) {
        Log.debug('handleFailed', mod);
        failed.push(mod);

        if (loaded.length + failed.length == files.length) {
            /**
             * Notify that modloading is complete.
             *
             * @event ModLoader#modloader&period;load&period;complete
             * @property    {String[]}  loaded
             * @property    {String[]}  failed
             */
            process.emit('modloader.load.complete', loaded.length, failed.length);
            process.removeListener('modloader.module.loaded', this.handleLoaded);
            process.removeListener('modloader.module.failed', this.handleFailed);

            Log.info('%d modules loaded, %d modules failed.', loaded.length, failed.length);
        }
    });

    /**
     * The default mod path.
     * @type    {String}
     * @constant
     */
    this.MOD_PATH                       = BASE_PATH + '/mod';

    /**
     * A list of loaded modules.
     * @type    {String[]}
     */
    this.modules                        = Protected({});
});

module.exports                          = new ModLoader;
