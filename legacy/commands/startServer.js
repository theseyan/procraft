var host = require('../host');

module.exports = {

    command: 'startServer',

    exec: (data, socket) => {
        host.execServer(socket);
    }

};