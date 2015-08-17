'use strict';

const AbstractCommand = require('jasmine/commands/AbstractCommand');
const Database = require('jasmine/Database');

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
