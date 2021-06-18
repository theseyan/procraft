var host = require('../host');

module.exports = {

    command: 'stopServer',

    exec: (data) => {
        host.stopServer();
    }

};