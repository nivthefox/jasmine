'use strict';

const util = require('util');

class AbstractObject {
    constructor () {
        if (this.constructor === AbstractObject) {
            throw new TypeError("Cannot construct Abstract instances directly.");
        }

        // todo: this.command_set = jasmine.CommandSet
        this._db = new Map; // todo: Replace this with the database object.

        this._contents = new WeakSet;
        this._dbref = this._db.get('dbref');
        this._sessions = new WeakSet;
        this._location = this._db.get('location');
    }

    /**
     * The set of contents associated with this object.
     * @returns {WeakSet}
     */
    get contents () {
        return this._contents;
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
     * The location object for the location of this object.
     * @returns {*}
     */
    get location () {
        return this._location;
    }

    set location (object) {
        if (!(object instanceof AbstractObject)) {
            throw new TypeError('Invalid location.');
        }
        this._location = object;
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

    /**
     * Places an object inside of this object.
     * @param object
     * @param from
     */
    enter (object) {
        let from = object.location;

        this._contents.add(object);
        object.location = this;

        if (from instanceof AbstractObject) {
            from.leave(object, this);
        }

        this.at_enter(object, from);
    }

    leave (object, to) {
        this._contents.delete(object);

        this.at_leave(object, to);
    }

    msg (message, from) {}
    search (string, global, types, location) {}

    /**
     * HOOK METHODS
     * These may optionally be implemented.
     */
    at_enter(object, from) {}
    at_leave(object, to) {}
}

module.exports = AbstractObject;