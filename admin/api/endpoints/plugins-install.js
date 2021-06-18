var server = require('../../../core/server/server');
var pluginManager = require('../../../core/pluginManager');
var config = require('../../../config.json');

module.exports = {

    type: 'post',

    route: '/plugins/install',

    handle: (req, res) => {
        if ((!req.files || Object.keys(req.files).length === 0 || !('jar' in req.files)) && (!req.body.url || req.body.url == '')) {
            return res.status(400).send({
                message: "Malformed or incomplete request"
            });
        }

        if(req.files && 'jar' in req.files) {
            if(!req.files.jar.name.endsWith(".jar")) {
                return res.status(400).send({
                    message: "Uploaded file is not a JAR file"
                });
            }

            req.files.jar.mv(config.server.root + '/plugins/' + req.files.jar.name, (err) => {
                if(err) {
                    return res.status(500).send({
                        message: "Failed to copy uploaded JAR to installation folder",
                        error: err
                    });
                }

                return res.status(200).send({
                    message: 'Plugin installed successfully'
                });
            });
        }else {
            pluginManager.download(req.body.url).then(() => {
                return res.status(200).send({
                    message: 'Plugin installed successfully'
                });
            }).catch(e => {
                return res.status(500).send({
                    message: "An internal error occurred",
                    error: e
                });
            });
        }
    }

};