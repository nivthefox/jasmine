'use strict';

const net = require('net');
const Session = require('game/Session');

class Server {
    constructor (config) {
        this.config = config;
        this._sessions = [];
    }

    get sessions () {
        return this._sessions;
    }

    onSocketConnect (socket) {
        let session = new Session(socket);
        session.at_connect();
        this._sessions.push(session);
    };

    start () {
        this.server = net.createServer();
        this.server.on('connection', this.onSocketConnect.bind(this));
        this.server.listen(this.config.port, this.config.address);
    }

    stop() {
        let session;
        while (session = this._sessions.pop()) {
            session.close();
        }

        this.server.removeListener('connection', this.onSocketConnect);
        this.server.close();
    }
}

module.exports = Server;