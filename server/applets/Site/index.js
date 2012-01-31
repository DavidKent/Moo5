var Route = require( './Routes.js' );


var Blog = module.exports = function( app ) {
	this._app = app;
	//console.log(this);
};

Blog.prototype.homeAction = function( request, response ) {
    var home_url = this._app.router.generateUrl('home');
    response.render('homepage.html', {
        siteName: 'Cool App Site'
    
    });
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