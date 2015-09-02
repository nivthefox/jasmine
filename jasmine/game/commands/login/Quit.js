'use strict';

const AbstractCommand = require('jasmine/commands/AbstractCommand');

/**
 * Syntax:
 *   quit
 *
 * Disconnects you from the game.
 *
 * See Also: logout
 */
class Quit extends AbstractCommand {
    static get command () {
        return 'quit';
    }

    execute () {
        // TODO: Messaging.
        this.caller.close();
    }
}

module.exports = Quit;
