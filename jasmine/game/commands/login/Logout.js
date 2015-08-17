'use strict';

const AbstractCommand = require('jasmine/commands/AbstractCommand');
const Database = require('jasmine/Database');

/**
 * Syntax:
 *   logout
 *
 * Sends you back to the login screen.
 *
 * See Also: quit
 */
class Logout extends AbstractCommand {
    static get command () {
        return 'logout';
    }

    execute () {
        let sessions = this.caller.player.sessions;
        sessions.delete(this.caller);
        delete this.caller.player;
        this.caller.at_connect();
    }
}

module.exports = Logout;
