'use strict';

const AbstractObject = require('jasmine/types/AbstractObject');
const Database = require('jasmine/Database');

class BaseObject extends AbstractObject {
    constructor () {
        super();

        this.db.object_type = 'jasmine/types/BaseObject';

        if (!this.db.name) {
            this.db.name = '';
            this.db.desc = '';
            this.db.location = '';
        }

        this._contents = Database.find({location: this});
    }

    /**
     * The set of contents associated with this object.
     * @returns {Array}
     */
    get contents () {
        return this._contents;
    }

    /**
     * The location object for the location of this object.
     * @returns {*}
     */
    get location () {
        return this.db.location;
    }

    set location (object) {
        if (!(object instanceof AbstractObject)) {
            throw new TypeError('Invalid location.');
        }
        this.db.location = object;
    }

    get name () {
        return this.db.name;
    }

    set name (name) {
        this.db.name = name;
    }

    /**
     * Places an object inside of this object.
     * @param object
     */
    enter (object) {
        // todo: Implement locks
        let from = object.location;

        this._contents.push(object);
        object.location = this;

        if (from instanceof AbstractObject) {
            from.leave(object, this);
        }

        this.at_enter(object, from);
    }

    /**
     * Removes an object from this object; called automatically by 'enter'.
     * @param object
     * @param to
     */
    leave (object, to) {
        const idx = this._contents.indexOf(object);

        if (idx > -1) {
            this._contents.splice(idx, 1);
            this.at_leave(object, to);
        }
    }

    search (query, global) {
        if (global !== true) {
            query.location = this.location;
        }

        return super.search(query);
    }

    /**
     * HOOK METHODS
     * These may optionally be implemented.
     */
    at_enter(object, from) {}
    at_leave(object, to) {}
}

module.exports = BaseObject;