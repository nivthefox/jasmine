'use strict';

class AbstractObject {
    constructor () {
        if (this.method === undefined) {
            throw new TypeError("Cannot construct Abstract instances directly.");
        }
    }
}

module.exports = AbstractObject;