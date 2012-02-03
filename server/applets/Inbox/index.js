var Route = require( './Routes.js' );
var req = require('../Requires.js');
var app = require('../../main.js');
var rm = require('../ResponseMethods.js');

var Blog = module.exports = function( app ) {
	this._app = app;
};

Blog.prototype.homeAction = function( request, response ) {
    var allowed = function() {
        response.setStatusCode(200);
        
        var page = req.walk.getPage('/inbox.html').toString();
        var session = app.security.getSession(request);
        var user = undefined;
        if(session != undefined)
            user = app.security._memoryDB.getSessionInfo(session).user;

        var newPage = req.renderer.to_html(page, {
            username : user
        });
        
        response.setContent(newPage);
        response.send();
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