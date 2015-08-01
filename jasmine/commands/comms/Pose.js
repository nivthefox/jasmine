'use strict';

const util = require('util');

class Pose {
    constructor () {
        this.command = 'pose';
        this.aliases = [':', 'emote'];
        this.syntax = ['pose <message>'];
        this.help = [
            'Sends a message to everyone in your current location.'
        ];
    }

    execute () {
        if (!this.args) {
            return this.caller.msg('Pose what?');
        }

        let message = util.format('%s %s', this.caller.name, this.args);
        this.location.contents.forEach(function (target) {
            target.msg(message, this.caller);
        });
    }
}
