'use strict';

const util = require('util');

class Say {
    constructor () {
        this.command = 'say';
        this.aliases = ['"'];
        this.syntax = ['say <message>'];
        this.help = [
                'Sends a message to everyone in your current location.'
        ];
    }

    execute () {
        if (!this.args) {
            return this.caller.msg('Say what?');
        }

        const message = util.format('%s says, "%s"', this.caller.name, this.args);
        this.location.contents.forEach(function (target) {
            target.msg(message, this.caller);
        });
    }
}
