var host = require('../host');

module.exports = {

    command: 'killServer',

    exec: (data) => {
        host.killServer();
    }

};