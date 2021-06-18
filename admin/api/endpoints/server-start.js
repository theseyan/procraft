var server = require('../../../core/server/server');

module.exports = {

    type: 'post',

    route: '/server/start',

    handle: (req, res) => {
        server.startServer().then(data => {
            res.status(200).send({
                message: 'Server start command issued successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to start server",
                error: err
            });
            return;
        });
    }

};