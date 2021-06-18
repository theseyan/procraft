const config = require('../config.json');
const socket = require(`zeromq`).socket(`pair`);
const address = `${config.host.zmqAddress}:${config.host.zmqPort}`;  

module.exports = {
    getSocket: () => socket,
    connect: () => {
        return new Promise((resolve, reject) => {
            socket.connect(address);
            resolve({
                socket: socket,
                on: (evt, handler) => {
                    var func = evt.startsWith("EVENT_")==false ? (message) => {
                        message = message.toString();
                        if(message.startsWith("EVENT_") == true) {
                            handler({
                                type: 'event',
                                event: message
                            });
                        }else {
                            message = JSON.parse(message);
                            handler(message);
                        }
                    } : (message) => {
                        message = message.toString();
                        if(message == evt) {
                            handler({
                                type: 'event',
                                event: message
                            });
                        }
                    };
                    socket.on("message", func);

                    return {
                        remove: () => {
                            socket.removeListener(evt, func);
                        }
                    };
                },
                send: (message) => {
                    if(typeof message=="string") socket.send(message);
                    else socket.send(JSON.stringify(message));
                }
            });
        });
    }
};