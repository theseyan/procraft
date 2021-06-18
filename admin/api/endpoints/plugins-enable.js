var server = require('../../../core/server/server');
var pluginManager = require('../../../core/pluginManager');

module.exports = {

    type: 'post',

    route: '/plugins/enable',

    handle: (req, res) => {
        pluginManager.enable(req.body.plugin).then(data => {
            return res.status(200).send({
                message: 'Enabled plugin successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to enable plugin",
                error: err
            });
            return;
        });
    }

};