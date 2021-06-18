var server = require('../../../core/server/server');
var pluginManager = require('../../../core/pluginManager');

module.exports = {

    type: 'post',

    route: '/plugins/delete',

    handle: (req, res) => {
        pluginManager.delete(req.body.plugin).then(data => {
            return res.status(200).send({
                message: 'Deleted plugin successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to delete plugin",
                error: err
            });
            return;
        });
    }

};