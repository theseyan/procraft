export var Event = () => {
    
    return {
        __eventHandlers: [],
    
        on: function(evt, handler) {
            if(!this.__eventHandlers[evt]) this.__eventHandlers[evt] = [];
            this.__eventHandlers[evt].push(handler);
            var id = this.__eventHandlers[evt].length-1;

            return {
                remove: () => {
                    this.__eventHandlers[evt].splice(id, 1);
                }
            };
        },

        fire: function(evt, data) {
            if(!this.__eventHandlers[evt]) return;
            
            for(var i=0; i<=this.__eventHandlers[evt].length-1; i++) {
                this.__eventHandlers[evt][i](data);
            }
        },

        wrap: function(evt, target, handler) {
            target.addEventListener(evt, handler);

            return {
                remove: () => {
                    target.removeEventListener(evt, handler);
                }
            };
        }
    };

};