var cons = require('./console.js');
var com = require('./commands.js');
    exports.setHook = function(){
        stdin = process.openStdin();
        stdin.on('data', function(inp) { var u = ""+inp; com.parseInput(u); });
    };