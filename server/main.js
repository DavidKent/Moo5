	var http = require('http'),
	handling = require('./utils/error_h.js'),
    cons = require('./utils/console.js'),
    req = require('./utils/request.js'),
	hook = require('./utils/key_hook.js'),
	com = require('./utils/commands.js'),
	walk = require('./static/walk.js');

		handling.begin();
		walk.loadResources();
		http.createServer(req.connection).listen(1337, "127.0.0.1");
		success();
	function success(){
		cons.alert('Server now open for connectons.');
		com.start();
	}
		hook.setHook();
