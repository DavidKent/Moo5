var cons = require('./console.js');
var moon = require('./moon.js');

var url = require('url');
var requests = 0;
var tests = false;

exports.getClientIp = function(request){
    return request.getClientIpAddress();
    };
    
exports.connection = function(request, result){
        var newres = exports.getResult('/public', request, result);
        if(newres != undefined)
        newres.send();
    }
exports.outputLoginPage = function(request,result){
        result.setStatusCode(200);
        result.setContentType('text/html');
        result.setContent(moon.getPage('/register.html'));
        result.send();
    }
exports.getResult = function(cutoff, request, result) {
        var h = request.getBasePath().replace(cutoff,''), ct = moon.getContentType(h);
            if(moon.getPage(h) == undefined) {
                exports.outputLoginPage(request, result);
                return;
            }
            if(logRequest(ct))
                update(request);
            if(tests)
                moon.test();
            result.setStatusCode(200);
            result.setContentType(ct);
            result.setContent(moon.getPage(h));
            return result;
    }
    
    function update(request) {
        requests++;
        cons.info("Connection["+requests+"] request recieved at "+ exports.getClientIp(request));
    }
    
exports.getRequests = function(){
        return requests;
    };
    
    function logRequest(href){
    //console.log(href);
        if(href.indexOf('html') == -1)
        return false;
     return true;
    }