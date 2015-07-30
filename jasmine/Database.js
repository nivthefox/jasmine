'use strict';

const fs = require('fs');
const loki = require('lokijs');
const path = require('path');
const util = require('util');

let instances = new Map;

class Database {
    constructor(game, name) {
        this.file = path.resolve(util.format('%s/data/%s.json', name));

        if (!this.file) {
            throw new Error('Invalid database filename.');
        }

        this.db = new loki(this.file);
        this.db.loadDatabase();
    }

    static getInstance (game, name) {
        let instance;
        let key = util.format('%s:%s', game, name);

        if (!instances.has(key)) {
            instance = new Database(game, name);
            instances.set(key, instance);
        }

        return instances.get(key);
    }

    static getCollection (game, db, name) {
        let instance = Database.getInstance(game, db);
        let collection = instance.db.getCollection(name);

        if (collection === null) {
            collection = instance.db.addCollection(name);
        }

        return collection;
    }
}

module.exports = Database;