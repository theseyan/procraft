var server = require('../../../core/server/server');

module.exports = {

    type: 'post',

    route: '/server/restart',

    handle: (req, res) => {
        server.restartServer().then(data => {
            res.status(200).send({
                message: 'Server restart command issued successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to restart server",
                error: err
            });
            return;
        });
    }

};