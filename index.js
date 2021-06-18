/**
 * Procraft - A full-featured web administration panel for Minecraft Servers
 * @author Sayanjyoti Das
*/

var config = require('./config.json');
var api = require('./core/api');
var util = require('./core/util');
var admin = require('./admin/admin');

util.log(`Launching Admin Panel...`);
admin.launch();
util.log(`Admin Panel started on Port ${config.main.adminPort}!`);