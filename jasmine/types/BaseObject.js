'use strict';

const AbstractObject = require('jasmine/types/AbstractObject');

class BasePlayer extends AbstractObject {
    constructor() {
        super();

        this.db.set('type', 'BasePlayer');

        this._contents = new WeakSet;
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

    /**
     * Removes an object from this object; called automatically by 'enter'.
     * @param object
     * @param to
     */
    leave (object, to) {
        this._contents.delete(object);

        this.at_leave(object, to);
    }

    /**
     * HOOK METHODS
     * These may optionally be implemented.
     */
    at_enter(object, from) {}
    at_leave(object, to) {}
}

module.exports = BasePlayer;