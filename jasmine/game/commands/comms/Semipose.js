'use strict';

const util = require('util');

const AbstractCommand = require('jasmine/commands/AbstractCommand');

/**
 * Syntax:
 *   semipose <message>
 *   ;<message>
 *
 * Sends a message to the room you are in, preceeded by your name.
 *
 * See Also: pose, say, @emit
 */
class Semipose extends AbstractCommand {
    static get command () {
        return 'semipose';
    }

    static get aliases () {
        return [';'];
    }

    execute () {
        if (!this.args) {
            return this.caller.send('Pose what?');
        }

        let message = util.format('%s%s', this.caller.name, this.args);
        this.caller.player.location.contents.forEach(function (target) {
            target.send(message, this.caller);
        });
    }
}

module.exports = Semipose;