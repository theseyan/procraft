var server = require('../../../core/server/server');

module.exports = {

    type: 'post',

    route: '/server/stop',

    handle: (req, res) => {
        server.stopServer().then(data => {
            res.status(200).send({
                message: 'Server stop command issued successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to stop server",
                error: err
            });
            return;
        });
    }

};