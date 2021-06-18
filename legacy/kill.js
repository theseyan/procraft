var fs = require('fs');
var pid = Number(fs.readFileSync('./server.pid', {encoding: "utf-8"}));
process.kill(pid);
fs.unlinkSync('./server.pid');