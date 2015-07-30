'use strict';

const util = require('util');

class AbstractObject {
    constructor () {
        if (this.constructor === AbstractObject) {
            throw new TypeError("Cannot construct Abstract instances directly.");
        }

        // todo: this.command_set = jasmine.CommandSet
        this._db = new Map; // todo: Replace this with the database object.

        this._dbref = this._db.get('dbref');
        this._sessions = new WeakSet;
    }

    /**
     * The database object associated with this object.
     * @returns {*}
     */
    get db () {
        return this._db;
    }

    /**
     * Returns the dbref for this object.
     * @returns {String}
     */
    get dbref () {
        return util.format('#%d', this._dbref);
    }

    /**
     * The set of sessions associated with this object.
     * Usually empty.
     * @returns {WeakSet}
     */
    get sessions () {
        return this._sessions;
    }

    /**
     * Convenience method to check whether an object is being actively controlled.
     * @returns {boolean}
     */
    hasPlayer () {
        return this._sessions.size > 0;
    }

    msg (message, from) {}
    search (string, global, types, location) {}
}

module.exports = AbstractObject;