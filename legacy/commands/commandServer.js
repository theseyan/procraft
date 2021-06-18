var host = require('../host');

module.exports = {

    command: 'commandServer',

    exec: (data) => {
        host.command(data.command);
    }

};