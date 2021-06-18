var host = require('../host');

module.exports = {

    command: 'restartServer',

    exec: (data, socket) => {
        host.restartServer(socket);
    }

};