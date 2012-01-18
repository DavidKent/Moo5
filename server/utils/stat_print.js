var cons = require('./console.js');
var util = require('util');
var req = require('./request.js');
exports.statPrint = function(){
    var tabs = "\t\t\t"
    var str = "\n\t\t----------------STAT-PRINT----------------------\n";
    str += tabs+"MEMORY USAGE RSS: " + util.inspect(process.memoryUsage().rss) + "\n"; 
    str += tabs+"MEMORY USAGE HEAP TOTAL: " + util.inspect(process.memoryUsage().heapTotal) + "\n"; 
    str += tabs+"MEMORY USAGE HEAP USED: " + util.inspect(process.memoryUsage().heapUsed) + "\n"; 
    str += tabs+"TIME UP: " + (process.uptime() / 60) + " minutes\n";
    str += tabs+"USER REQUESTS: " + req.getRequests() +"\n";
    str += "\t\t----------------STAT-PRINT----------------------";
    cons.info(str);
};