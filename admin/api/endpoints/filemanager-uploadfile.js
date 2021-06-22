var config = require('../../../config.json');
var path = require('path');

module.exports = {

    type: 'post',

    route: '/filemanager/uploadfile',

    handle: (req, res) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send({
                message: "Malformed or incomplete request"
            });
        }

        if(req.files) {
            if(req.files.files.length) {
                var doneNum = 0;
                var done = () => {
                    doneNum++;
                    if(doneNum == req.files.files.length) {
                        return res.status(200).send({
                            message: 'Files uploaded successfully'
                        });
                    }
                };
                req.files.files.forEach(file => {
                    file.mv(path.join(config.server.root, req.body.path, file.name), (err) => {
                        if(err) {
                            return res.status(500).send({
                                message: "Failed to upload files",
                                error: err
                            });
                        }
                        done();
                    });
                });
            }else {
                req.files.files.mv(path.join(config.server.root, req.body.path, req.files.files.name), (err) => {
                    if(err) {
                        return res.status(500).send({
                            message: "Failed to upload file",
                            error: err
                        });
                    }
                    return res.status(200).send({
                        message: 'File uploaded successfully'
                    });
                });
            }
        }
    }

};