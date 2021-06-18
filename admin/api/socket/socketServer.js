var api = require('../../../core/api');
var server = require('../../../core/server/server');

module.exports = {
    init: (io) => {
        io = io.of('/api/socket');
        io.on('connection', (socket) => {
            if(!socket.handshake.query.accessToken) socket.disconnect();
            
            // Authenticate access token
            api.authenticateToken(socket.handshake.query.accessToken, (data) => {
                if(data.error) {
                    socket.disconnect();
                    return;
                }

                var session = {
                    logStream: null
                };

                socket.on('logStream', (data) => {
                    if(data.toggle == true) {
                        if(session.logStream != null) {
                            session.logStream.tail.unwatch();
                            session.logStream.clear();
                            session.logStream = null;
                        }

                        session.logStream = server.streamLog((message) => {
                            io.emit('cmd_message', {
                                text: message
                            });
                        });
                    }
                    else if(data.toggle == false) {
                        if(session.logStream != null) {
                            session.logStream.tail.unwatch();
                            session.logStream.clear();
                            session.logStream = null;
                        }
                    }
                });
                

                var events = [];
                events.push(server.events.on('SERVER_READY', () => {
                    server.getState().then(status => {
                        io.emit('event', {
                            event: 'SERVER_READY',
                            data: status
                        });
                    });
                }));
                events.push(server.events.on('SERVER_STARTING', () => {
                    server.getState().then(status => {
                        io.emit('event', {
                            event: 'SERVER_STARTING',
                            data: status
                        });
                    });
                }));
                events.push(server.events.on('SERVER_EXITED', () => {
                    server.getState().then(status => {
                        io.emit('event', {
                            event: 'SERVER_EXITED',
                            data: status
                        });
                    });
                }));

                socket.on('disconnect', () => {
                    events.forEach(handler => {
                        handler.remove();
                    });
                    if(session.logStream!=null) {
                        session.logStream.tail.unwatch();
                        session.logStream.clear();
                        session.logStream = null;
                    }
                });
            });
        });

    }
};