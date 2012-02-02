var Route = require( './Routes.js' );
var req = require('../Requires.js');
var app = require('../../main.js');

var Blog = module.exports = function( app ) {
	this._app = app;
	
};

Blog.prototype.homeAction = function( request, response ) {
    var home_url = this._app.router.generateUrl('home');

    var allowed = function() {
        response.setStatusCode(200);
        response.setContent(req.walk.getPage('/logged_in.html').toString());
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
                console.log('logged in');
            }
            console.log(app.security.getSession(request));
            console.log(request.getClientIpAddress());
            app.security.logIn(app.security.getSession(request), 'desperado', request.getClientIpAddress(), onlogin);
        }
        var notcorrect = function() {
            console.log('no username found with that password');
        }
        app.security._mongodb.isCorrectLogin('desperado', 'sfshadow12', correct, notcorrect);
    }
    app.security.handle(request, response, ['user','admin'], loggedin, notloggedin); //returning notloggedin every time
 
};


Blog.prototype.register = function( request, response ) {
    var loggedin = function() {
        alreadyLoggedIn(response);
    }
    var notloggedin = function() {
        var query = request.getQuery();
        var canregister = function(){
            var onregistered = function(){
                var onlogin = function(){
                }
                app.security.logIn(app.security.getSession(request), 'desperado', request.getClientIpAddress(), onlogin);
            }
            app.security.registerUser( 'desperado', 'sfshadow12', 'user', { email: 'desperado1234@live.com' }, onregistered);
        }
        var cantregister = function(){
            cantRegister(response);
        }
        app.security._mongodb.canRegister(request.getClientIpAddress(), canregister, cantregister);
    }
    app.security.handle(request, response, ['user','admin'], loggedin, notloggedin);
};

function alreadyLoggedIn(response) {
    response.setStatusCode(401);
    response.setContent("Already Logged In");
    response.send();
}
function cantRegister(response) {
    response.setStatusCode(401);
    response.setContent("You cannot register any more accounts");
    response.send();
}