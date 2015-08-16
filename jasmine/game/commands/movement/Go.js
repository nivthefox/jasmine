'use strict';

class Go {
    //this.syntax = ['go <object>'];
    //this.help = [
    //    'Moves you into the specified <object>. If <object> is an ' +
    //    'exit, you will instead be moved to its destination.'
    //];

    static get command () { return 'go'; }
    static get aliases () { return ['goto', 'enter', 'move']; }

    execute () {
        if (!this.args) {
            return this.caller.msg('Go where?');
        }

        this.caller
            .search({name: this.args.join(' ')}, false)
            .catch(searchFailure.bind(this))
            .then(searchSuccess.bind(this))
            .done();
    }

    searchFailure (reason) {
        return this.caller.msg(reason);
    }

    searchSuccess (objects) {
        let target;

        if (objects.length > 1) {
            // todo: Could probably give them the list of options, here.
            return this.caller.send("I don't know which you mean!");
        }
        target = objects[0];

        target.enter(this.caller);
    }
}
