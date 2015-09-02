'use strict';

const JasmineSession = require('jasmine/Session');

// LOGIN COMMANDS
const CreateCommand = require('commands/login/Create');
const LoginCommand = require('commands/login/Login');
const LogoutCommand = require('commands/login/Logout');
const QuitCommand = require('commands/login/Quit');

// PLAYER COMMANDS

class Session extends JasmineSession {
    constructor () {
        super();

        this.addCommand(CreateCommand);
        this.addCommand(LoginCommand);
        this.addCommand(QuitCommand);
    }

    at_become (/* obj */) {
        // Remove login commands.
        this.removeCommand(CreateCommand);
        this.removeCommand(LoginCommand);

        // Add player commands.
        this.addCommand(LogoutCommand);
    }

    at_command_not_found (/* command, switches, args */) {}
    at_connect () {}
}

module.exports = Session;
