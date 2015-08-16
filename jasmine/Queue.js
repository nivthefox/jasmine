'use strict';

const util = require('jasmine/Util');

const Config = require('jasmine/Config');
const Map = require('jasmine/Map');

const COMMAND_PARSER = /^([^ \/]+)(\/[^ ]+)*(.*)/g;
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

    process (instruction) {
        this.queue.delete(instruction.pid);

        let input = instruction.input.toString('utf8');
        let parsed = input.match(COMMAND_PARSER);

        if (instruction.owner.commands.has(parsed[0])) {
            let Command = instruction.owner.commands.get(parsed[0]);
            let instance = new Command(instruction.owner, parsed[1], parsed[2]);
            instance.execute();
        }
        else {
            instruction.owner.at_command_not_found(parsed[0], parsed[1], parsed[2]);
        }
    }
}

module.exports = Queue;