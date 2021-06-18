var logger = require('nodejslogger');
logger.init({"file": "./logs/serverHost.log", "mode":"DIE"});

module.exports = {

    debug: (msg) => {console.log(msg);logger.debug(msg);},
    log: (msg) => {console.log(msg);logger.info(msg)},
    error: (msg) => {console.error(msg);logger.error(msg)},

};