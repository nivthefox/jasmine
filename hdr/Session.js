/**
 * An enum of available statuses.
 * @name Status
 * @memberof Session
 * @enum {Integer}
 */
module.exports.Status = {
    NEW : 0,
    CONNECTING : 1,
    CONNECTED : 2,
    DISCONNECTING : 3,
    DISCONNECTED : 4,
    TIMEDOUT : 5
};