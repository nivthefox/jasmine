/**
 * __          __   _ _   _                  _
 * \ \        / /  (_) | | |                | |
 *  \ \  /\  / / __ _| |_| |__    _ __   ___| |_
 *   \ \/  \/ / '__| | __| '_ \  | '_ \ / _ \ __|
 *    \  /\  /| |  | | |_| | | |_| | | |  __/ |_
 *     \/  \/ |_|  |_|\__|_| |_(_)_| |_|\___|\__|
 *
 * @created     2013-02-12
 * @edited      2013-02-12
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
var Crypto                              = require('crypto');
var Database                            = require(BASE_PATH + '/src/Database');
var Log                                 = require(BASE_PATH + '/src/Log').getLogger('User');
var User;
var Util                                = require(BASE_PATH + '/src/Utilities');

var config                              = require(BASE_PATH + '/config/game.yml');

/**
 * The required format for a username.
 *
 * @name    User#nameFormat
 * @private
 * @member
 * @type    {RegExp}
 */
var nameFormat                          = /^[A-z0-9_\-+.]{2,24}$/

/**
 * The password salt.
 *
 * @name User#passwordSalt
 * @private
 * @member
 * @type    {String}
 */
var passwordSalt                        = config.passwordSalt || '';

var hashPassword = function(val) {
    var hash                    = Crypto.createHash('sha1');
        hash.update(passwordSalt);
        hash.update(val);
    return hash.digest('hex');
};

/**
 * The User object schema.
 * @name    User#schema
 * @private
 * @member
 * @type    {Database.Schema}
 */
var schema = new Database.Schema({
    name : {
        type                            : 'String',
        match                           : nameFormat,
        required                        : true,
        index                           : true
    },
    password : {
        type                            : 'String',
        required                        : true,
        set                             : hashPassword
    },
    alias : {
        type                            : 'String',
        match                           : nameFormat,
        index                           : true
    }
});

schema.method('checkPassword', function(val) {
    var check                           = hashPassword(val);
    return check === this.password;
});

/**
 * Validates that user names and aliases are truly unique.
 * @name    User#validateName
 * @private
 * @method
 * @param   {Function}      next
 */
schema.pre('save', function(next) {
    Log.debug('validateName');

    var uniqueNameQuery = { $or : [
        {name : this.name},
        {name: this.alias},
        {alias: this.name},
        {alias: this.alias}
    ]};
    User.count(uniqueNameQuery, function(err, count) {
        if (count > 0) {
            next(new Error('That name or alias is already taken.'));
        }
        else {
            next();
        }
    })
});

/**
 * Allows objects to be owned by a User.
 */
var ownerPlugin = function(schema, options) {
    schema.add({
        owner : {
            type                        : Database.Schema.Types.ObjectId,
            ref                         : 'User',
            index                       : true
        }
    });
}

/**
 * Adds the created and updated plugins.
 */
schema.plugin(Database.getPlugin('created'));
schema.plugin(Database.getPlugin('updated'));
Database.addPlugin('owner', ownerPlugin);

/**
 * The User model.
 * @name User
 * @class
 */
var User                                = Database.model('User', schema);
User.on('error', function(err) {
    Log.debug('error', err);
});
module.exports                          = User;
