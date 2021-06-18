import {io} from 'socket.io-client';
import {Session, Util} from '../Core';
import {Event} from '../Event';
import {Notify} from '../UI';

export var SocketService = {

    // Attach an Event system
    events: Event(),

    // Stores state
    state: {},

    // Stores the active socket connection
    socket: null,

    // Attaches event listeners to the socket
    attachEventHandlers: (socket) => {

        SocketService.socket.on('event', (data) => {
            SocketService.events.fire('event', data);
        });

        SocketService.socket.on('cmd_message', (data) => {
            SocketService.events.fire('cmd_message', data);
        });

        SocketService.socket.on('connect', (data) => {
            Util._('LoadScreen').style.display = 'none';
        });
        socket.on('disconnect', () => {
            Util._('LoadScreen').style.display = 'flex';
        });
    },

    // Connects to the socket and joins a room
    connect: () => {
        if(SocketService.socket!=null) SocketService.socket.disconnect();

        SocketService.socket = io('/api/socket', {
            transports: ['websocket'],
            query: `accessToken=${Session.token}`,
            reconnection: true
        });

        SocketService.socket.once('connect_error', (err) => {
            Notify('error', 'Failed to connect to Socket Server');
        });
        
        SocketService.attachEventHandlers(SocketService.socket);
    },

    // Tells the server the client wants to listen to log
    startLogStream: () => {
        SocketService.socket.emit('logStream', {
            toggle: true
        });
    },

    // Tells the server the client wants to stop listening to logs
    stopLogStream: () => {
        SocketService.socket.emit('logStream', {
            toggle: false
        });
    },

};

// Connect to Socket
SocketService.connect();

window.SocketService = SocketService;