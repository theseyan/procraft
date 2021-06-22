var api = require('../../../core/api');

module.exports = {

    type: 'get',

    route: '/filemanager/getfiles',

    handle: (req, res) => {
        api.getDirFiles(req.query.path).then(data => {
            res.status(200).send({
                message: 'Fetched files successfully',
                files: JSON.stringify(data)
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to read directory",
                error: err
            });
            return;
        });
    }

};