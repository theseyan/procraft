var server = require('../../../core/server/server');

module.exports = {

    type: 'post',

    route: '/server/kill',

    handle: (req, res) => {
        server.killServer().then(data => {
            res.status(200).send({
                message: 'Kill server command issued successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to kill server",
                error: err
            });
            return;
        });
    }

};