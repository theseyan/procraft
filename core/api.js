var config = require('../config.json');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var db = require('../admin/db');
var propertiesReader = require('properties-reader');
var privateKey = fs.readFileSync(config.main.api.privateKey);
var request = require('request');
var logger = require('nodejslogger');
var server = require('./server/server');
logger.init({"file": "./logs/main.log", "mode":"DIE"});

module.exports = new function() {

    this.authenticateToken = (token, cb) => {
        jwt.verify(token, privateKey, function(err, decoded) {
            if(err) {
                cb({error: err});
                return;
            }
            cb({userId: decoded.id, uname: decoded.sub});
        });
    };

    this.getOnlinePlayers = () => {
        return new Promise((resolve, reject) => {
            request.get(config.main.severtapApi + '/v1/players', {}, (err, res, body) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(body));
            });
        });
    };

    this.getSystemStatus = (socket) => {
        return new Promise((resolve, reject) => {
            var result = {
                server: {}
            };
            var properties = propertiesReader(path.join(config.server.root, 'server.properties'));
            result.server.maxPlayers = properties.get('max-players');
            result.server.name = properties.get('motd');
            result.server.pvp = properties.get('pvp');

            this.getServerStatus().then(status => {
                result.server.status = status;
                if(status == 'online') {
                    this.getOnlinePlayers().then(players => {
                        result.server.onlinePlayers = players;
                        result.server.onlinePlayersNum = players.length;
                        
                        resolve(result);
                    }).catch(e => {
                        this.error(e);
                        result.server.onlinePlayers = [];
                        result.server.onlinePlayersNum = '?';

                        resolve(result);
                    });
                }else {
                    resolve(result);
                }
            });
        });
    };

    this.login = (data, cb) => {

        db.execute(`SELECT * FROM admin_users WHERE uname = ? AND password = ?`, [data.username, data.password], (err, res) => {
            if(err) {
                cb({error: err});
                return;
            }

            if(res.length <= 0) {
                cb({error: 'No such user exists.'});
                return;
            }

            var token = jwt.sign({ sub: res[0].uname, id: res[0].id }, privateKey, { expiresIn: '30d' });
            cb({
                token: token,
                user: res[0]
            });
        });

    };

};