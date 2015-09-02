'use strict';

class AbstractCommand {
    constructor (caller, switches, args) {
        if (this.constructor === AbstractCommand) {
            throw new TypeError('Cannot construct Abstract instances directly.');
        }

        this.caller = caller;
        if (switches) this.switches = switches.split('/');
        if (args) this.args = args.split(' ');
    }

    static get command () { throw new Error('Command must define syntax'); }
    static get aliases () { return []; }

    execute () {}
}

module.exports = AbstractCommand;