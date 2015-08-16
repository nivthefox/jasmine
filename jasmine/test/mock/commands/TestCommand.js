'use strict';

const AbstractCommand = require('jasmine/commands/AbstractCommand');

class TestCommand extends AbstractCommand {
    static get command () { return 'test'; }
    static get aliases () { return ['foo', ':', '"', '@test']; }
    execute () {
        process.emit('executed TestCommand');
    }
}

module.exports = TestCommand;
