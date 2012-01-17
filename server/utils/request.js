var cons = require('./console.js');
var moon = require('../static/walk.js');
var url = require('url');
var requests = 0;
var tests = false;

exports.getClientIp = function(request){
	return request.connection.remoteAddress;
	};
	
exports.connection = function(request, result){
		var h = url.parse(request.url).href, ct = moon.getContentType(h);
		if(logRequest(h))
			update(request);
		if(tests)
			moon.test();
		result.writeHead(200, {'Content-Type': ct});
		if(moon.getPage(h) == undefined)
			result.end(moon.getPage('/register.html'));
		result.end(moon.getPage(h));
	};
	function update(request) {

		requests++;
		cons.info("Connection["+requests+"] request recieved at "+ exports.getClientIp(request));
	}
exports.getRequests = function(){
		return requests;
	};
	function logRequest(href){
		if(href.indexOf('html') == -1)
		return false;
	 return true;
	}