/**
 * Server Host daemon
 * Runs detached from main process and manages the actual Minecraft server
*/

process.title = "ProcraftServerHost";

var server = require('./core/server');
var http = require('http');
var logger = require('./core/server/logger');

logger.log('Launching host server...');

// Launch server
server.launch().then(socket => {
    logger.log('Host server running!');
    
    // Notify main process
    socket.send('EVENT_HOST_STARTED');
    logger.log('EVENT_HOST_STARTED sent to main process!');
});