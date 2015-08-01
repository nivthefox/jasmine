'use strict';

const BaseObject = require('jasmine/types/BaseObject');

class BasePlayer extends BaseObject {
    constructor() {
        super();

        this.db.object_type = 'jasmine/types/BasePlayer';
        this.db.aliases = [];
    }
}

module.exports = BasePlayer;