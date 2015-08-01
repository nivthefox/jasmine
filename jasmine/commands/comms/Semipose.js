'use strict';

const util = require('util');

class Pose {
    constructor () {
        this.command = 'semipose';
        this.aliases = [';', 'emote'];
        this.syntax = ['semipose <message>'];
        this.help = [
            'Sends a message to everyone in your current location.'
        ];
    }

    execute () {
        if (!this.args) {
            return this.caller.msg('Pose what?');
        }

        const message = util.format('%s %s', this.caller.name, this.args);
        this.location.contents.forEach(function (target) {
            target.msg(message, this.caller);
        });
    }
}
