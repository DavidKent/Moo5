var cons = require('./console.js');   

exports.begin = function(){
        process.on('uncaughtException', function(err) {
            cons.error(err.stack);
        });
        process.on('error', function(err) {
            cons.error(err.stack);
        });
    }