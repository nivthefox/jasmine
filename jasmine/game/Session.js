const JasmineSession = require('jasmine/Session');

const CreateCommand = require('game/commands/login/Create');
const LoginCommand = require('game/commands/login/Login');
const QuitCommand = require('game/commands/login/Quit');

class Session extends JasmineSession {
    constructor (socket) {
        super(socket);

        this.addCommand(CreateCommand);
        this.addCommand(LoginCommand);
        this.addCommand(QuitCommand);
    }
}

module.exports = Session;