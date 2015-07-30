'use strict';

const AbstractObject = require('jasmine/types/AbstractObject');

class BasePlayer extends AbstractObject {
    constructor() {
        super();

        this.db.set('type', 'BasePlayer');
    }
}

module.exports = BasePlayer;