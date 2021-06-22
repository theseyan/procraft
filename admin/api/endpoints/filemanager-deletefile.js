var api = require('../../../core/api');

module.exports = {

    type: 'post',

    route: '/filemanager/deletefile',

    handle: (req, res) => {
        api.deleteFile(req.body.path).then(data => {
            res.status(200).send({
                message: 'Deleted file successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to delete file",
                error: err
            });
            return;
        });
    }

};