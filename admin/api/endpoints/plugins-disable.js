var server = require('../../../core/server/server');
var pluginManager = require('../../../core/pluginManager');

module.exports = {

    type: 'post',

    route: '/plugins/disable',

    handle: (req, res) => {
        pluginManager.disable(req.body.plugin).then(data => {
            return res.status(200).send({
                message: 'Disabled plugin successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to disable plugin",
                error: err
            });
            return;
        });
    }

};