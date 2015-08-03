'use strict';

const crypto = require('crypto');
const BaseObject = require('jasmine/types/BaseObject');

class BasePlayer extends BaseObject {
    constructor() {
        super();

        this.db.object_type = 'jasmine/types/BasePlayer';

        if (!this.db.aliases) {
            this.db.aliases = [];
        }
    }

    static encrypt (salt, string) {
        return crypto
            .createHmac('sha512', salt)
            .update(string)
            .digest('hex');
    }

    set password (password) {
        this.db.password = BasePlayer.encrypt(this.dbref, password);
    }

    checkPassword (password) {
        var check = BasePlayer.encrypt(this.dbref, password);
        return (check === this.db.password);
    }
}

module.exports = BasePlayer;
