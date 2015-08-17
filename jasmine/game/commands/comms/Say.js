'use strict';

const util = require('util');

const AbstractCommand = require('jasmine/commands/AbstractCommand');

/**
 * Syntax:
 *   say <message>
 *   "<message>
 *
 * Says a message to the room you are in, preceeded by your name.
 *
 * See Also: semipose, pose, @emit
 */
class Say extends AbstractCommand {
    static get command () {
        return 'say';
    }

    static get aliases () {
        return ['"'];
    }

    execute () {
        if (!this.args) {
            return this.caller.msg('Say what?');
        }

        const message = util.format('%s says, "%s"', this.caller.name, this.args);
        this.caller.player.location.contents.forEach(function (target) {
            target.send(message, this.caller);
        });
    }
}

module.exports = Say;
