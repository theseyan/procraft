const config = require('../../config.json');
var util = require('../util');
var path = require('path');
const fs = require('fs');
const {spawn} = require('child_process');
var Tail = require('tail').Tail;
var pinger = require('minecraft-pinger');
var throttle = require('throttle-debounce').throttle;
var propertiesReader = require('properties-reader');
var fd = fs.openSync('./logs/minecraft/in.log', 'a');

var mcServer = {
    process: {
        running: false,
        ready: false
    },
    server: null,
    details: {}
};

module.exports = new function() {

    this.getState = () => {
        return new Promise((resolve, reject) => {
            resolve(mcServer);
        });
    };
    this.events = new util.Events();

    this.getServerDetails = () => {
        var properties = propertiesReader(path.join(config.server.root, 'server.properties'));
        var details = {};
        details.maxPlayers = properties.get('max-players');
        details.name = properties.get('motd');
        details.pvp = properties.get('pvp');
        details.difficulty = properties.get('difficulty');

        return details;
    };

    // Fetch details initially
    mcServer.details = this.getServerDetails();

    // Long polling for detecting Minecraft server state change
    var poll = throttle(config.main.pingInterval, false, () => {
        pinger.ping('127.0.0.1', 25565, (error, result) => {
            if (error) {
                mcServer.server = null;
                if(mcServer.process.ready == true) {
                    mcServer.process.ready = false;
                    mcServer.process.running = false;
                    this.events.fire('SERVER_EXITED', {});
                }
            }else {
                mcServer.server = result;
                if(mcServer.process.ready == false) {
                    mcServer.process.ready = true;
                    mcServer.process.running = true;
                    this.events.fire('SERVER_READY', {});
                }
            }
            poll();
        });
    });
    poll();

    this.startServer = () => {
        if(mcServer.process.running == true) return;

        // Refresh details
        mcServer.details = this.getServerDetails();

        return new Promise((resolve, reject) => {
            fs.writeFileSync('./logs/minecraft/out.log', '');
            fs.writeFileSync('./logs/minecraft/error.log', '');
            fs.writeFileSync('./logs/minecraft/in.log', '');

            var out = fs.openSync('./logs/minecraft/out.log', 'a');
            var err = fs.openSync('./logs/minecraft/error.log', 'a');
            var inp = fs.openSync('./logs/minecraft/in.log', 'r');
            
            var cmd = [
                '-jar',
                `-Xms${config.server.minMemory}M`,
                `-Xmx${config.server.maxMemory}M`,
                config.server.jar,
            ];
            var process = spawn('java', cmd.concat(config.server.arguments), {
                cwd: path.normalize(config.server.root),
                detached: true,
                stdio: [inp, out, err]
            });

            // Write PID to file
            fs.writeFileSync('./server.pid', process.pid, {encoding: 'utf-8'});

            process.unref();
            mcServer.process.running = true;
            
            this.events.fire('SERVER_STARTING', {});
            fs.closeSync(out);
            fs.closeSync(inp);
            fs.closeSync(err);

            resolve();
        });
    };

    this.stopServer = () => {
        return new Promise((resolve, reject) => {
            fs.writeSync(fd, "stop\n");
            mcServer.process.running = false;
            resolve();
        });
    };

    this.killServer = () => {
        return new Promise((resolve, reject) => {

            var pid = Number(fs.readFileSync('./server.pid', {encoding: "utf-8"}));
            process.kill(pid);
            fs.unlink('./server.pid',(err) => {
                if(err) {
                    reject(err);
                    return;
                }

                mcServer.process.running = false;
                this.events.fire('SERVER_EXITED', {});

                resolve();
            });
        });
    };

    this.command = function(cmd) {
        return new Promise((resolve, reject) => {
            fs.writeSync(fd, cmd + "\n");
            resolve();
        });
    };

    this.restartServer = () => {
        return new Promise((resolve, reject) => {
            var cont = () => {
                this.startServer();
                var restart = this.events.on('SERVER_READY', () => {
                    this.events.fire('SERVER_RESTARTED', {});
                    restart.remove();
                });
                resolve();
            };

            if(mcServer.process.running == true) {
                this.stopServer();
                this.events.once('SERVER_EXITED', () => {
                    cont();
                });
            }else {
                cont();
            }
        });
    };

    this.streamLog = (cb) => {
        // Windows hack for detecting file changes
        var interval = setInterval(() => {
            fs.open('./logs/minecraft/out.log', 'r', (err, fd) => {fs.close(fd, ()=>{});});
        }, 1000);
        var tail = new Tail("./logs/minecraft/out.log", {
            fromBeginning: true,
            useWatchFile: false,
            fsWatchOptions: {}
        });
        tail.on("line", (data) => {
            cb(data);
        });
        tail.on("error", (error) => {
            console.log('ERROR: ', error);
        });

        return {
            tail: tail,
            clear: () => {
                clearInterval(interval);
            }
        };
    }

};