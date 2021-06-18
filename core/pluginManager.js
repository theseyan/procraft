var fs = require('fs');
var path = require('path');
var mv = require('mv');
var req = require('request');
var config = require('../config.json');
var { DownloaderHelper } = require('node-downloader-helper');
var UserAgent = require('user-agents');
const userAgent = new UserAgent();

function download(url, dest) {
    return new Promise((resolve, reject) => {
      fs.access(dest, fs.constants.F_OK, (err) => {
        if (err === null) reject('File already exists');
  
        const request = req.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest, { flags: 'wx' });
                file.on('finish', () => resolve());
                file.on('error', err => {
                    file.close();
                    if (err.code === 'EEXIST') reject('File already exists');
                    else fs.unlink(dest, () => reject(err.message));
                });
                response.pipe(file);
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                    //Recursively follow redirects, only a 200 will resolve.
                    download(response.headers.location, dest).then(() => resolve());
                } else {
                    reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
                }
            });
        
            request.on('error', err => {
              reject(err.message);
            });
        });
    });
}

module.exports = new function() {

    this.getPlugins = () => {
        return new Promise((resolve, reject) => {
            fs.readdir(path.join(config.server.root, '/plugins'), {encoding: 'utf-8'}, (err, enabled) => {
                if(err) {
                    reject(err);
                    return;
                }
                fs.readdir(path.join('./', config.main.content, 'plugins', 'disabled'), {encoding: 'utf-8'}, (err, disabled) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    enabled = enabled.filter(file => file.endsWith('.jar'));
                    disabled = disabled.filter(file => file.endsWith('.jar'));
                    var result = {
                        enabled: [],
                        disabled: []
                    };
                    for(var i=0; i<=enabled.length-1; i++) {
                        var jar = enabled[i].replace('.jar', '').replace(/-/g, ' ').replace(/_/g, ' ');
                        result.enabled.push({
                            name: jar,
                            jar: enabled[i]
                        });
                    }
                    for(var i=0; i<=disabled.length-1; i++) {
                        var jar = disabled[i].replace('.jar', '').replace(/-/g, ' ').replace(/_/g, ' ');
                        result.disabled.push({
                            name: jar,
                            jar: disabled[i]
                        });
                    }
                    resolve(result);
                });
            });
        });
    };

    this.get = (plugin) => {
        return new Promise((resolve, reject) => {
            var loc1 = path.join(config.server.root, 'plugins', plugin);
            var loc2 = path.join('./', config.main.content, 'plugins', 'disabled', plugin);

            fs.stat(loc1, function(err, stat) {
                if(err == null) {
                    
                    resolve({
                        name: plugin.replace('.jar', '').replace(/-/g, ' ').replace(/_/g, ' '),
                        jar: loc1,
                        disabled: false
                    });

                } else if(err.code === 'ENOENT') {
                    fs.stat(loc2, function(err, stat) {
                        if(err == null) {
                            
                            resolve({
                                name: plugin.replace('.jar', '').replace(/-/g, ' ').replace(/_/g, ' '),
                                jar: loc2,
                                disabled: true
                            });
        
                        } else if(err.code === 'ENOENT') {
                            reject(new Error("Plugin file not found"));
                        } else {
                            reject(new Error("An error occurred"));
                        }
                    });
                } else {
                    reject(new Error("An error occurred"));
                }
            });
        });
    };

    this.disable = (plugin) => {
        return new Promise((resolve, reject) => {
            var jar = path.join(config.server.root, 'plugins', plugin);
            
            fs.stat(jar, function(err, stat) {
                if(err == null) {
                    
                    mv(jar, path.join('./', config.main.content, 'plugins', 'disabled', plugin), (err) => {
                        if(err) {
                            reject(err);
                        }else {
                            resolve();
                        }
                    });

                } else if(err.code === 'ENOENT') {
                    reject(new Error("Plugin file not found"));
                } else {
                    reject(new Error("An error occurred"));
                }
            });
        });
    };

    this.enable = (plugin) => {
        return new Promise((resolve, reject) => {
            var jar = path.join('./', config.main.content, 'plugins', 'disabled', plugin);
            
            fs.stat(jar, function(err, stat) {
                if(err == null) {
                    
                    mv(jar, path.join(config.server.root, 'plugins', plugin), (err) => {
                        if(err) {
                            reject(err);
                        }else {
                            resolve();
                        }
                    });

                } else if(err.code === 'ENOENT') {
                    reject(new Error("Plugin is not disabled / file not found"));
                } else {
                    reject(new Error("An error occurred"));
                }
            });
        });
    };

    this.delete = (plugin) => {
        return new Promise((resolve, reject) => {
            this.get(plugin).then(data => {
                fs.unlink(data.jar, (err => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve();
                }));
            });
        });
    };

    this.download = (url) => {
        return new Promise((resolve, reject) => {
            const dl = new DownloaderHelper(url, path.join('./', config.main.content, 'plugins', 'temp'), {
                headers: {
                    "User-Agent": userAgent.toString()
                }
            });

            dl.on('end', (info) => {
                mv(path.normalize(info.filePath), path.join(config.server.root, 'plugins', info.fileName), (err) => {
                    if(err) {
                        reject(err);
                    }else {
                        resolve(info);
                    }
                });
            });
            dl.on('error', (err) => {
                reject(err);
            });
            dl.start();
        });
    };

};