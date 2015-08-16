'use strict';

const AbstractCommand = require('jasmine/commands/AbstractCommand');
const Database = require('jasmine/Database');
const Player = require('game/types/Player');

/**
 * Syntax:
 *   create <name> <password>
 *
 * Creates a new character.
 *
 * See Also: login
 */
class Create extends AbstractCommand {
    static get command () {
        return 'create';
    }

    execute () {
        let name = this.args[0];
        let password = this.args[1];
        let player = new Player;

        player.password = password;
        player.name = name;

        this.caller.become(player);
    }
}

module.exports = Create;
