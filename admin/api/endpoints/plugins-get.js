var server = require('../../../core/server/server');
var pluginManager = require('../../../core/pluginManager');

module.exports = {

    type: 'get',

    route: '/plugins/get',

    handle: (req, res) => {
        pluginManager.getPlugins().then(data => {
            res.status(200).send({
                message: 'Fetched plugins successfully',
                plugins: JSON.stringify(data)
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to fetch plugins",
                error: err
            });
            return;
        });
    }

};