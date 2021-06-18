var server = require('../../../core/server/server');

module.exports = {

    type: 'post',

    route: '/server/command',

    handle: (req, res) => {
        server.command(req.body.command).then(data => {
            res.status(200).send({
                message: 'Command issued successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to command server",
                error: err
            });
            return;
        });
    }

};