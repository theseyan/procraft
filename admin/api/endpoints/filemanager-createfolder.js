var api = require('../../../core/api');

module.exports = {

    type: 'post',

    route: '/filemanager/createfolder',

    handle: (req, res) => {
        api.makeDirectory(req.body.path, req.body.folder).then(data => {
            res.status(200).send({
                message: 'Created folder successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to create folder",
                error: err
            });
            return;
        });
    }

};