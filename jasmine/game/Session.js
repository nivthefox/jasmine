'use strict';

const JasmineSession = require('jasmine/Session');

// LOGIN COMMANDS
const CreateCommand = require('game/commands/login/Create');
const LoginCommand = require('game/commands/login/Login');
const LogoutCommand = require('game/commands/login/Logout');
const QuitCommand = require('game/commands/login/Quit');

// PLAYER COMMANDS

class Session extends JasmineSession {
    constructor () {
        super();

        this.addCommand(CreateCommand);
        this.addCommand(LoginCommand);
        this.addCommand(QuitCommand);
    }

    at_become (obj) {
        // Remove login commands.
        this.removeCommand(CreateCommand);
        this.removeCommand(LoginCommand);

        // Add player commands.
        this.addCommand(LogoutCommand);
    }

    at_command_not_found () {}
    at_connect () {}
}

module.exports = Session;
