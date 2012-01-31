    var http = require('http'),
    handling = require('./utils/error_h.js'),
    cons = require('./utils/console.js'),
    req = require('./utils/request.js'),
    hook = require('./utils/key_hook.js'),
    com = require('./utils/commands.js'),
    walk = require('./static/walk.js'),
    quasar = require('./quasar/Quasar/Quasar.js');
    var config = require( './Config.js' );
    var routes = require( './Routes.js' );
        
        var test;
        
        handling.begin();
        walk.loadResources();
        var u = new quasar( routes, config );
        u.init(function() {
            cons.alert('Server now open for connectons.');
            u.set('StaticFileServer', new Object());
            u.router.setServiceHandler('StaticFileServer', req.connection);
        });
       
        com.start();
        hook.setHook();