var config = require('../config.json');
var jwt = require('jsonwebtoken');
var fs = require('fs-extra');
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
    
    this.getDirFiles = (dir) => {
        return new Promise((resolve, reject) => {
            var data = [];
            dir = path.join(config.server.root, dir);
            fs.readdir(dir, (err, files) => {
                if(err) {
                    reject(err);
                    return;
                }

                files.forEach((file) => {
                    var filePath = path.join(dir, file);
                    var stat = fs.statSync(filePath);

                    data.push(stat.isDirectory() ? {
                        file: file,
                        dir: stat.isDirectory()
                    } : {
                        file: file
                    });
                });

                resolve(data);
            });
        });
    };

    this.deleteFile = (src) => {
        return new Promise((resolve, reject) => {
            // Delete image file
            fs.unlink(path.join(config.server.root, src), (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve({});
            });
        });
    };

    this.deleteFolder = (src) => {
        return new Promise((resolve, reject) => {
            // Delete image file
            fs.remove(path.join(config.server.root, src), (err) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve({});
            });
        });
    };

    this.makeDirectory = (src, folder) => {
        return new Promise((resolve, reject) => {
            var fullPath = path.join(config.server.root, src, folder);
            fs.ensureDir(fullPath).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    };

    this.readFile = (src) => {
        src = path.join(config.server.root, src);
        return new Promise((resolve, reject) => {
            var stat = fs.statSync(src);
            if(stat.isDirectory() === true) return reject(new Error("Given path is a folder"));
            fs.readFile(src, {encoding: 'utf-8'}, function(err, data){
                if (!err) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
    };

    this.setFile = (src, content) => {
        src = path.join(config.server.root, src);
        return new Promise((resolve, reject) => {
            var stat = fs.statSync(src);
            if(stat.isDirectory() === true) return reject(new Error("Given path is a folder"));
            fs.writeFile(src, content, function(err){
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    },

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