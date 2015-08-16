'use strict';

const util = require('jasmine/Util');

const Config = require('jasmine/Config');
const Map = require('jasmine/Map');

const COMMAND_PARSER = /^([^ /]+)(\/[^ ]+)*(.*)/;
const QUEUE_SPEED = 0.01;
const SINGLETON = Symbol('instance');
const SINGLETON_ENFORCER  = Symbol('enforcer');

class Queue {
    constructor (enforcer) {
        if (enforcer !== SINGLETON_ENFORCER) {
            throw new TypeError('Cannot construct singleton.');
        }

        this._pid = 0;
        this._queue = new Map;
    }

    static get instance () {
        if (!this[SINGLETON]) {
            this[SINGLETON] = new Queue(SINGLETON_ENFORCER);
        }

        return this[SINGLETON];
    }

    get pid () {
        if (this._pid++ >= Number.MAX_SAFE_INTEGER) { this._pid = 0; }
        return this._pid;
    }

    get queue () {
        return this._queue;
    }

    drain (session) {
        this.queue.forEach(function (v, k, queue) {
            if (!session || v.session === session) {
                clearTimeout(v.timeout);

                // TODO: Add quiet flag to remove this spam.
                v.owner.send('Process %n cancelled by drain.', v.pid); // TODO: i18n

                queue.delete(k);
            }
        });
    }

    getQueueTime (instruction) {
        let list = this.queue.filter(function (inst) {
            return (inst.owner === instruction.owner);
        });
        let offset = (list.length > 0)
            ? util.getTimeLeft(list[list.length-1].process)
            : 10;
        let timeout = QUEUE_SPEED * Config.get('queue_speed') * list.length;
        return timeout + offset;
    }

    queueRequest (owner , buffer) {
        let instruction = {
            pid: this.pid,
            owner: owner,
            input: buffer
        };

        instruction.process = setTimeout(this.process.bind(this, instruction),
            this.getQueueTime(instruction));
        this.queue.set(instruction.pid, instruction);

        return instruction.pid;
    }

    tryCommand (session, command, switches, args) {
        if (!session.commands.has(command)) {
            return false;
        }

        let Command = session.commands.get(command);
        let instance = new Command(session, switches, args);
        instance.execute();
        return true;
    }

    process (instruction) {
        this.queue.delete(instruction.pid);

        let input = instruction.input.toString();
        let parsed = input.match(COMMAND_PARSER);
        let session = instruction.owner;
        let command = parsed[1].toLowerCase();
        let switches = parsed[2];
        let args = parsed[3] || '';

        if (!this.tryCommand(session, command, switches, args)) {
            let len = 0;
            let cmdstr;
            let found = false;

            while (len < command.length) {
                cmdstr = command.substr(0, ++len);

                if (this.tryCommand(session, cmdstr, switches, command.substr(len) + args)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                session.at_command_not_found(command, switches, args);
            }
        }
    }
}

module.exports = Queue;