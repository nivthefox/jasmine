'use strict';

const AbstractCommand = require('jasmine/commands/AbstractCommand');
const Database = require('jasmine/Database');

/**
 * Syntax:
 *   login <name> <password>
 *   connect <name> <password>
 *   l <name> <password>
 *   c <name> <password>
 *
 * Connects to an existing character.
 *
 * See Also: create
 */
class Login extends AbstractCommand {
    static get command () {
        return 'login';
    }

    static get aliases () {
        return ['connect', 'l', 'c'];
    }

    execute () {
        let name = this.args[0];
        let password = this.args[1];

        let objs = Database.query([{name: name}, {alias: name}]);

        if (objs.length === 1) {
            objs = objs[0];
            if (objs.checkPassword && objs.checkPassword(password)) {
                this.caller.become(objs);
            }
        }

        return this.caller.send('Either that player does not exist, or has a different password.'); // TODO: i18n
    }
}