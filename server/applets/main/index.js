var Route = require( './Routes.js' );
var req = require('../Requires.js');
var app = require('../../main.js');
var rm = require('../ResponseMethods.js');

var Blog = module.exports = function( app ) {
	this._app = app;
	
};

Blog.prototype.homeAction = function( request, response ) {
    var home_url = this._app.router.generateUrl('home');

    var allowed = function() {
        response.setStatusCode(200);
        
        var page = req.walk.getPage('/logged_in.html').toString();
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
        response.setStatusCode(200);
        response.setContent(req.walk.getPage('/register.html').toString());
        response.send();
    }
    app.security.handle(request, response, ['user','admin'], allowed, notallowed);
};

Blog.prototype.logIn = function( request, response ) {
    var loggedin = function() {
        alreadyLoggedIn(response);
    }
    var notloggedin = function() {
        var query = request.getQuery();
        console.log(query);
        var correct = function() {
            var onlogin = function(){
                  rm.success(response);
            }
            app.security.logIn(app.security.getSession(request), query.user, request.getClientIpAddress(), onlogin);
        }
        var notcorrect = function() {
        }
        app.security._mongodb.isCorrectLogin(query.user, query.pass, correct, notcorrect);
    }
    app.security.handle(request, response, ['user','admin'], loggedin, notloggedin); //returning notloggedin every time
 
};


Blog.prototype.register = function( request, response ) {
    var loggedin = function() {
        rm.alreadyLoggedIn(response);
    }
    var notloggedin = function() {
        var query = request.getQuery();
        var canregister = function(){
            var onregistered = function(){
                var onlogin = function(){
                    rm.success(response);
                }
                app.security.logIn(app.security.getSession(request), query.user, request.getClientIpAddress(), onlogin);
            }
            app.security.registerUser( query.user, query.pass, 'user', { email: query.email }, onregistered);
        }
        var cantregister = function(){
            rm.cantRegister(response);
        }
        app.security._mongodb.canRegister(request.getClientIpAddress(), canregister, cantregister);
    }
    app.security.handle(request, response, ['user','admin'], loggedin, notloggedin);
};

