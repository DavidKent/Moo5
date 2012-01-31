var fs = require( 'fs' );
var path = require( 'path' );

/*
    Function: Renderer

        Renderer object constructor.

    Parameters:

        quasar - {Object} Refrence to Quasar object
*/
var Renderer = module.exports = function( quasar ) {
	this._quasar = quasar;
    this._viewEngine;
    this._buildViewMap();
};



/*
    Function: setViewEngine

        Sets the view engine object.
        
    Parameters:
        
        engine - {Object} refrence to the view engine object
*/
Renderer.prototype.setViewEngine = function( engine ) {
    this._viewEngine = engine;
};



/*
    Function: _setViewEngine

        Creates a map of view names and view file path. [Performes sync IO]
*/
Renderer.prototype._buildViewMap = function() {
    var rawApplets = this._quasar.getAllRawApplets();
    
    var appletNames = Object.keys( rawApplets );
    
    for ( var i = 0, len = appletNames.length; i < len; ++i ) {
        var name = appletNames[ i ];
        var applet = rawApplets[ name ];
        applet.views = {};
        
        //skip loaidng applet vies if the view folder does ot exist
        if ( !path.existsSync( applet.appletViewDir ) ) {
            continue;
        }
        
        var viewFiles = fs.readdirSync( applet.appletViewsDir );
        
        for (var j = 0, jlen = viewFiles.length; j < jlen; ++j ) {
            applet.views[ viewFiles[ j ] ] = applet.appletViewsDir + viewFiles[ j ];
        }
    }
};



/*
    Function: render

        Get the rendered contents of a view with the given properties
        
    Parameters:
    
        applet - {String} Name of the raw applet to which the view belongs
        viewName - {String} Name of the view
        props - {Object} Object to pass to pass to view engine for the current view
        
    Return:
        
        {String} Rendered contents of the view
*/
Renderer.prototype.render = function( applet, viewName, props ) {
    var rawApplets = this._quasar.getAllRawApplets();
    var path = rawApplets[ applet ].views[ viewName ];
    
    return this._viewEngine.render( path, props );
};