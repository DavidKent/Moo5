    var h = require('./stat_print.js');
    var app = require('../main.js');
    var vdc = require('./various_db_commands.js');
    var cons = require('./console.js');
    var fs = require('fs');
    exports.parseInput = function(inp){
                var t = inp.substring(0,inp.length-2);
                switch(t)
                {
                    case "exit":
                        cons.alert("Exiting the server...");
                        setCont(false);
                    break;
                    case "sprint":
                    case "statprint":
                    case "stat":
                    case "stat print":
                        h.statPrint();
                    break;
                    case "test":
                        
                    break;
                    case "m -send":
                     var time = new Date().getTime();
                     var data = { 
                                    description: 'MOST RECENT',
                                    sentby: time,
                                    to: 'desperado',
                                    from: 'hooplah',
                                    message: 'hello'
                                
                                }
                        vdc.sendMessage(app.database, data, function(){});
                    break;
                    case "m -clear":
                        vdc.clearMessages(app.database);
                    break
                    case "m -print":
                        vdc.getMessages(app.database, 'desperado', function(data){
                        for(var i = 0; i < data.length; i++)
                            console.log(data[i]);
                        }, function(){ console.log('no documents found'); });
                    break;
                    case "restart":
                        cons.alert("Restarting the server...");
                        setCont(true);
                    break;
                    default:
                        cons.error("'"+t+"' is an unrecognized command.");
                    break;
                }
        };
    function setCont(restart){
        if(restart)
        fs.writeFile("./cont.ctr", "1", function(){process.exit(1);});
        else
        fs.writeFile("./cont.ctr", "0", function(){process.exit(1);});
    }
    exports.start = function(){
        fs.writeFile("./cont.ctr", "2", function(){});
    };