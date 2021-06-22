var api = require('../../../core/api');

module.exports = {

    type: 'post',

    route: '/filemanager/deletefolder',

    handle: (req, res) => {
        api.deleteFolder(req.body.path).then(data => {
            res.status(200).send({
                message: 'Deleted folder successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to delete folder",
                error: err
            });
            return;
        });
    }

};