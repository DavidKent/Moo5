var logging = true;
var fs = require('fs');
var fix="\033[0;37m", time="\033[32m";
   function log(msg, color){
        var col;
        switch(color)
        {
            case "red":
            case "error":
                col = "\033[31m";
            break;
            case "green":
                col = "\033[32m";
            break;
            case "yellow":
            case "warning":
                col = "\033[33m";
            break;
            case "magenta":
                col = "\033[1;35m";
            break;
            case "blue":
                col = "\033[1;34m";
            break;
            case "cyan":
                col = "\033[1;36m";
            break;
            case "alert":
                col = "\033[37m";
            break;
            case "main":
            case "info":
            case "white":
                col = "\033[37m";
            break;
        }
        
        var msg = col + "[" + color.toUpperCase() + "]" + "[" + time + getDateStr() + col + "] " + msg + fix;
        console.log(msg);
    }
    function getDateStr(){
        var now = new Date(),
        isPM = false,
        min = now.getMinutes(),
        hour = now.getHours() > 12 ? now.getHours() - 12 : now.getHours(),
        day = now.getDate(),
        month = now.getMonth() + 1,
        year = now.getFullYear();
        if(now.getHours()>12)
            isPM = true;
        if(hour == 0)
            hour=12;
        var m = isPM?"PM":"AM";
        var date = month +"\\"+ day +"\\" + year.toString().substring(2,4) + " " + hour +":"+ min+m; 
        return date; 
    }
    exports.error = function(msg){
        log(msg, "error");
        if(!logging)
            return;
        try{
            fs.readFile("./logs/error.log", function(err,data){
            var d = data;
                d += "\n\r[" +getDateStr() + "] "+msg; 
                fs.writeFile("./logs/error.log",d, function(){});
            });
        }
        catch(err){
            fs.writeFile("./logs/error.log","["+getDateStr()+"] "+msg, function(){});    
        }
    };
    exports.info = function(msg){
        log(msg, "info");
    };
    exports.alert = function(msg){
        log(msg, "alert");
    };
    