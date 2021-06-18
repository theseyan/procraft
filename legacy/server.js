const config = require('../config.json');
const socket = require(`zeromq`).socket(`pair`);
const address = `${config.host.zmqAddress}:${config.host.zmqPort}`;  
var fs = require('fs');
var logger = require('./server/logger');

// Stores all commands
var commands = [];

// Load all the server host commands
var commandFiles = fs.readdirSync('./core/server/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./server/commands/${file}`);
    commands[command.command] = command.exec;
}
logger.log(`Loaded ${Object.keys(commands).length} commands into server host!`);

module.exports = {
    launch: () => {
        return new Promise((resolve, reject) => {
            socket.bindSync(address);

            socket.on(`message`, function (msg) {
                var obj = JSON.parse(msg);

                if(obj.command in commands) {
                    commands[obj.command](obj.data, socket);
                    socket.send(JSON.stringify(obj));
                }
            });

            // Heartbeat messages
            setInterval(() => {
                socket.send('EVENT_HEARTBEAT');
            }, config.host.heartbeat);

            resolve(socket);
        });
    },
    getSocket: () => socket
};