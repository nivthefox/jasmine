'use strict';

class AbstractCommand {
    constructor (caller, switches, args) {
        this.caller = caller;
        if (switches) this.switches = switches.split('/');
        if (args) this.args = args.split(' ');
    }

    static get command () { throw new Error('Command must define syntax'); }
    static get aliases () { return []; }

    execute () {
        throw new Error('Command must implement execute method.');
    }
}

module.exports = AbstractCommand;