var server = require('../../../core/server/server');

module.exports = {

    type: 'get',

    route: '/system/status',

    handle: (req, res) => {
        try {
            server.getState().then(status => {
                res.status(200).send(status);
            });
        }
        catch(err) {
            res.status(500).send({
                message: "An error occurred while trying to get system status",
                error: err
            });
            return;
        }
    }

};