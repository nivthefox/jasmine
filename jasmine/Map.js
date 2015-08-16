'use strict';

class JasmineMap extends Map {

    /**
     * Filters elements of the Map and returns a new Map.
     * @param {Function} callback
     * @param {*} thisArg
     * @return {JasmineMap}
     */
    filter (callback, thisArg) {
        var newMap = new JasmineMap;

        this.forEach(function (v, k) {
            if (callback(v, k, this)) {
                newMap.set(k, v);
            }
        });

        return newMap;
    }
}

module.exports = JasmineMap;