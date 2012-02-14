var Route = require( './Routes.js' );
var req = require('../Requires.js');
var app = require('../../main.js');
var rm = require('../ResponseMethods.js');
var vdc = require('../../utils/various_db_commands.js');
var mongo = require('mongodb');

var Blog = module.exports = function( app ) {
	this._app = app;
};

Blog.prototype.homeAction = function( request, response ) {
    var allowed = function() {
        response.setStatusCode(200);

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
                        id : docs[i]._id,
                        description : docs[i].description,
                        sentby : docs[i].sentby,
                        user : docs[i].from,
                        message : docs[i].message
                    });
                     
                }
            var finalPage = req.renderer.to_html(page, { username: user, messages : _messages });
            response.setContent(finalPage);
            response.send();
        }
        var nodocs = function(){ 
            response.setContent(req.renderer.to_html(page, { username: user, messages: '' })); //don't want a placeholder sent to client
            response.send();
        }
        
        vdc.getMessages(app.database, user, hasdocs, nodocs);
    }
    var notallowed = function() {
        rm.restricted(response);
    }
    app.security.handle(request, response, ['user','admin'], allowed, notallowed);
};



//4f3952274d86451007000001
Blog.prototype.deleteMessage = function( request, response ) {
    var query = request.getQuery();
    
    var allowed = function() {
        var session = app.security.getSession(request);
        var user = undefined;
        if(session != undefined)
            user = app.security._memoryDB.getSessionInfo(session).user;
        var newQuery = {_id: new mongo.ObjectID(query.id), to: user};
        vdc.removeMessage(app.database, newQuery);
        rm.success(response);
    }
    var notAllowed = function() {
       rm.restricted(response);
    }
    app.security.handle(request, response, ['user','admin'], allowed, notAllowed);
};


Blog.prototype.sendMessage = function( request, response ) {
    var query = request.getQuery();
    var allowed = function() {
        var session = app.security.getSession(request);
        var user = undefined;
        if(session != undefined)
            user = app.security._memoryDB.getSessionInfo(session).user;
        query.from = user;
        query.sentby = new Date().getTime();
        
        console.log(query);
        vdc.sendMessage(app.database, query, function(){
            rm.success(response);
        });
    }
    var notAllowed = function() {
       rm.restricted(response);
    }
    app.security.handle(request, response, ['user','admin'], allowed, notAllowed);
};