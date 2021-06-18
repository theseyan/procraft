var routes = require('./routes');
var apiRoutes = require('./api/routes');
var config = require('../config.json');
var bodyParser = require('body-parser');
var express = require('express');
var ssModule = require('./api/socket/socketServer');
const http = require('http');
const fileUpload = require('express-fileupload');

module.exports = new function() {

    this.app = null;

    this.launch = () => {
        return new Promise((resolve, reject) => {
            this.app = express();
            var socketServer = http.createServer(this.app);
            var io = require('socket.io')(socketServer);

            // Launch Socket server
            ssModule.init(io);

            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({
                extended: true
            }));
            this.app.use(fileUpload());

            // Set view engine for frontend
            this.app.set('view engine', 'ejs');
            
            // Serve static files
            this.app.use(express.static('./admin/static'));

            // Set up routes
            routes.setup(this.app);
            apiRoutes.setup(this.app);

            socketServer.listen(config.main.adminPort);
            resolve();
        });
    };

};