'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

// todo: stubs should be replaced with lokijs
let dbrefs = 0;
let data = {};

class Database {
    constructor () {
        if (!this.dbref) {
            this.dbref = dbrefs++;
        }

        data[this.dbref] = this;
    }

    static find(query) {
        return Object.keys(data)
            .filter(function (key) {
                var value = data[key];
                var keep = false;

                for (var qk in query) {
                    var qv = query[qk];
                    if (typeof qv === 'object') {
                        switch (true) {
                            case qv.hasOwnProperty('$in'):
                                keep = (qv.$in.indexOf(value[qk]) > -1);
                                break;
                            case qv.hasOwnProperty('$gt'):
                                keep = (value[qk] > qv.$gt);
                                break;
                            case qv.hasOwnProperty('$gte'):
                                keep = (value[qk] >= qv.$gte);
                                break;
                            case qv.hasOwnProperty('$lt'):
                                keep = (value[qk] < qv.$lt);
                                break;
                            case qv.hasOwnProperty('$lte'):
                                keep = (value[qk] <= qv.$lte);
                                break;
                        }
                    }
                    else if (typeof qv !== 'undefined') {
                        keep = (qv === value[qk]);
                    }
                }

                return keep;
            })
            .map(function (key) {
                return Database.load(data[key].dbref);
            });
    }

    static load (dbref) {
        var object = data[dbref];

        if (object.type) {
            var type = require(object.type);
            return new type(object);
        }

        return object;
    }

    static __wipe () {
        dbrefs = 0;
        data = {};
    }
}

module.exports = Database;