var logger = require('nodejslogger');
logger.init({"file": "./logs/main.log", "mode":"DIE"});

module.exports = new function() {

    this.debug = (msg) => {console.log(msg);logger.debug(msg);};
    this.log = (msg) => {console.log(msg);logger.info(msg)};
    this.error = (msg) => {console.error(msg);logger.error(msg)};

    this.Events = function() {
        this.__eventHandlers = [];
        
        this.on = (evt, handler) => {
            if(!this.__eventHandlers[evt]) this.__eventHandlers[evt] = [];
            this.__eventHandlers[evt].push(handler);
            var id = this.__eventHandlers[evt].length-1;
            
            return {
                remove: () => {
                    this.__eventHandlers[evt].splice(id, 1);
                }
            };
        };

        this.once = (evt, handler) => {
            var listener = this.on(evt, (data => {
                handler(data);
                listener.remove();
            }));
        };

        this.fire = (evt, data) => {
            if(!this.__eventHandlers[evt]) return;
            
            for(var i=0; i<=this.__eventHandlers[evt].length-1; i++) {
                this.__eventHandlers[evt][i](data);
            }
        };
    };

};