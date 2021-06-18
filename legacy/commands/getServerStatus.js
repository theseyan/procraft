var host = require('../host');

module.exports = {

    command: 'getServerStatus',

    exec: (data, socket) => {
        var state = host.getState();

        socket.send(JSON.stringify({
            type: 'response',
            command: 'getServerStatus',
            response: state.ready==true ? 'online' : (state.running==true ? 'starting' : 'offline')
        }));
    }

};