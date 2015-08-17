'use strict';

const util = require('util');

const AbstractCommand = require('jasmine/commands/AbstractCommand');

/**
 * Syntax:
 *   pose <message>
 *   :<message>
 *   emote <message>
 *
 * Sends a message to the room you are in, preceeded by your name and a space.
 *
 * See Also: semipose, say, @emit
 */
class Pose extends AbstractCommand {
    static get command () {
        return 'pose';
    }

    static get aliases () {
        return [':', 'emote'];
    }

    execute () {
        if (!this.args) {
            return this.caller.send('Pose what?');
        }

        let message = util.format('%s %s', this.caller.name, this.args);
        this.caller.player.location.contents.forEach(function (target) {
            target.send(message, this.caller);
        });
    }
}

module.exports = Pose;
