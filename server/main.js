    var req = require('./applets/Requires.js'),
    security = require('./Security.js');
    
    init();
    
    var server = new req.quasar( req.routes, req.config );
    
    server.set('StaticFileServer', new Object());
    server.router.setServiceHandler('StaticFileServer', req.request.connection);
    
    var database = new security.database('test', "127.0.0.1", 27017);
    var ironhide = new security.ironhide(server, database);
    server.init(onServerStart);

    function init(){
        req.handling.begin();
        req.walk.loadResources();
        req.com.start();
        req.hook.setHook();
    }
    function onServerStart() {
        req.cons.alert('Server now open for connectons.');
        database.connect(function() {
            database.addCollections( function(){ 
                console.log('Required collections not found, creating them.');
            });
            req.cons.alert('Database connected successfully.');
        });
    }
    exports.app = server;
    exports.database = database;
    exports.security = ironhide;