var Route = require( './Routes.js' );
var req = require('../Requires.js');
var app = require('../../main.js');
var rm = require('../ResponseMethods.js');
var vdc = require('../../utils/various_db_commands.js');

var Blog = module.exports = function( app ) {
	this._app = app;
};

Blog.prototype.homeAction = function( request, response ) {
    var allowed = function() {
        console.log('allowed');
        response.setStatusCode(200);
        var time = new Date().getTime();
        //vdc.sendMessage(app.database, { id:"asd", description: "brief description of...", sentby:time, to:"desperado", from:"hooplah"}, function(){});
        var page = req.walk.getPage('/inbox.html').toString();
        var message = req.walk.getPage('/modules/message.html').toString();
        var session = app.security.getSession(request);
        var user = undefined;
        if(session != undefined)
            user = app.security._memoryDB.getSessionInfo(session).user;
        
        var hasdocs = function(docs){
            var _messages = "";
            for(var i = 0; i < docs.length; i++) //foreach message to user we build the html and add it
                {
                    _messages += req.renderer.to_html(message, {
                        id : docs[i].id,
                        description : docs[i].description,
                        sentby : docs[i].sentby,
                        user : docs[i].from,
                        message : docs[i].message
                    });
                     
                }
                console.log(_messages);
            var finalPage = req.renderer.to_html(page, { username: user, messages : _messages });
            console.log(finalPage);
            response.setContent(finalPage);
            response.send();
        }
        var nodocs = function(){ 
            response.setContent(req.renderer.to_html(page, { username: user, messages: '' })); //don't want a placeholder sent to client
            response.send();
        }
        
        vdc.getMessages(user, app.database, hasdocs, nodocs);
    }
    var notallowed = function() {
        rm.restricted(response);
    }
    app.security.handle(request, response, ['user','admin'], allowed, notallowed);
};




Blog.prototype.readPostAction = function( request, response ) {
    console.log('heyo!');
};


Blog.prototype.createPost = function( request, response ) {
    
};


Blog.prototype.updatePost = function( request, response ) {
    
};
    
    
    
Blog.prototype.deletePost = function( request, response ) {
    
};