var api = require('../../../core/api');
var path = require('path');

module.exports = {

    type: 'get',

    route: '/editor/getfile',

    handle: (req, res) => {
        api.readFile(req.query.path).then(data => {
            res.status(200).send({
                message: 'Read file content successfully',
                data: {
                    content: data,
                    name: path.basename(req.query.path)
                }
            });
        }).catch(err => {
            res.status(500).send({
                message: "An error occurred while trying to read file contents",
                error: err
            });
            return;
        });
    }

};