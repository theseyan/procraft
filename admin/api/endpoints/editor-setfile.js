var api = require('../../../core/api');

module.exports = {

    type: 'post',

    route: '/editor/setfile',

    handle: (req, res) => {
        api.setFile(req.body.path, req.body.content).then(data => {
            res.status(200).send({
                message: 'Set file content successfully'
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to set file contents",
                error: err
            });
            return;
        });
    }

};