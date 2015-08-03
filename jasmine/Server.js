'use strict';

const net = require('net');

class Server {
    constructor (config) {
        this.config = config;
        this._sessions = [];
    }

    get sessions () {
        return this._sessions;
    }

    onSocketConnect (socket) {};

    start () {
        this.server = net.createServer();
        this.server.on('connection', this.onSocketConnect.bind(this));
        this.server.listen(this.config.port);
    }

    stop() {
        this.server.removeListener('connection', this.onSocketConnect);
        this.server.close();
    }
}

module.exports = Server;