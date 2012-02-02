var fs = require( 'fs' );

var Services = require( '../Services.js' ).Services;
var Server = require( '../Server.js' ).Server;
var WSServer = require( '../Server.js' ).WSServer;
var Router = require( '../Router.js' ).Router;
var Http = require( '../Http.js' );
var Renderer = require( '../Renderer.js' ).Renderer;


/*
    Function: Quasar

        Quasar object constructor.

    Parameters:

        appRoutes - {Object} Refrence to the application routes object
        config - {Object} Refrence to application config object
*/
var Quasar = module.exports = function( appRoutes, config ) {
    if ( typeof appRoutes !== 'object' || typeof config !== 'object' ) {
        throw Error( 'name: "Bad Parameter", description: "Expecting type `object` for parameters `routes` and `config`."' );
    }
    
    this.config = config;
    this._appRoutes = appRoutes;

    this._services = new Services;

    this.server = new Server( this, this.getRequestHandler() );
    
    this._wsServers = {};
    
    this.router = new Router( this, this.server );
    
    this._services.add( 'Server', this.server );
    this._services.add( 'Router', this.router );
    this._services.add( 'Logger', this._logger );

    this._appletsRaw = {};
    this._applets = {};
    
    this.autoloadApplets();
};




/*
    Function: init

        Initialize the application. Caches's all views and starts HTTP and WebSocket servers. If WebScoket server is required
        
    Parameters:
    
        fn - [Optional] {Function} Function to call on HTTP server start
*/
Quasar.prototype.init = function( fn ) {
    this.router.buildRoutes();
    this.renderer = new Renderer( this );
    var self = this;
    this.server.start( function() {
        var wsRoutes = self.router.getWSRoutes();
        for ( var wsRoute in wsRoutes ) {
            self._wsServers[ wsRoute ] = new WSServer( self, wsRoutes[ wsRoute ], self.getWSRequestHandler() );
        }

        fn();
    } );

    

};



/*
    Function: autoloadApplets

        Autoload and Use application Applets. This function performes blocking IO (require())
*/
Quasar.prototype.autoloadApplets = function() {
    var rawAppletNames = fs.readdirSync( this.config.APPLETS_DIR );
    
    for (var i = 0, len = rawAppletNames.length; i < len; ++i ) {
        var thisDir = this.config.APPLETS_DIR + rawAppletNames[ i ];
        var stat = fs.statSync( thisDir );
        if ( !stat.isDirectory() ) {
            continue;
        }
        
        var appletPath = this.config.APPLETS_DIR + rawAppletNames[ i ];
        
        this._appletsRaw[ rawAppletNames[ i ] ] = {
            object: require( appletPath + '/index.js' ),
            routes: require( appletPath + '/Routes.js' ),
            security: require( appletPath + '/Security.js' ),
            appletViewsDir: appletPath + '/views/'
        };
    }
};



/*
    Function: getApplet

        Return information on the specified applet
        
    Parameters:
        
        applets - {String} Name of the applet .. as defined on the main application Route file
        
    Returns: {Object} Hash-array contains properties `object` and `routes`
*/
Quasar.prototype.getApplet = function( applet ) {
    return this._applets[ applet ];
};




/*
    Function: getAllRawApplets

        Return information on the specified applet
        
    Returns: {Object} Hash-array contains properties `object`, `routes` and `viewPath`.
*/
Quasar.prototype.getAllRawApplets = function() {
    return this._appletsRaw;
};

    

/*
    Function: getAllApplets

        Return information about all of the registered applets

    Returns: {Object} Hash-array contains properties `object` and `routes`.
*/
Quasar.prototype.getAllApplets = function() {
    return this._appletsRaw;
};



/*
    Function: set

        Set an object as a service, accessable application wide
        
    Parameters:
        
        name - {String} Name of service being set
*/
Quasar.prototype.set = function( name, obj ) {
    if ( !name || !obj ) {
        throw Error( 'name: "Bad Parameter", discription: "Expected parameters of types `string` and `object`"' );
    }
    
    this._services.add( name, obj );
};



/*
    Function: get

        Get a refrence to the requested service
        
    Parameters:
        
        name - {String} Name of service being requested

    Returns:

        {Object} Requested service or undefined if none exist by that handle
*/
Quasar.prototype.get = function( name ) {
    return this._services.get( name );
};



/*
    Function: addApplet

        Add an initialized applet object
        
    Parameters:
        
        name - {String} Name of applet
        applet - {Object} Refrence to applet object
*/
Quasar.prototype.addApplet = function( name, applet ) {
    if ( !name || !applet ) {
        throw Error( 'name: "Bad Parameter", description: "Expected parameters of types `string` and `object`"' );
    }

    this._applets[ name ] = applet;
};



/*
    Function: getAppRoutes

        Get the application routes object that was passed to Quasar by the app

    Returns:

        {Object} Application routes object
*/
Quasar.prototype.getAppRoutes = function() {
    return this._appRoutes;
};



/*
    Function: getRequestHandler

        Wrapper for the request handler of all client requests
        
    Returns:
    
        {Function} request handler
*/
Quasar.prototype.getRequestHandler = function() {
    var self = this;
    return function( req, res ) {
        try {
            var request = new Http.Request( req );
            var response = new Http.Response( res );
            
            if ( self.server.isSecure() ) {
                request.setServerSecure( true );
            }

            //hand request off to router
            self.router.findRoute( request, response );
        } catch( e ) {
            self.catch( e );
        }
    };
};



/*
    Function: getWSRequestHandler

        Returns call back to be used for all WS client connections
        
    Returns:
    
        {Function} WS request handler
*/
Quasar.prototype.getWSRequestHandler = function() {
    var self = this;
    // connection handler
    return function( wsInfo, socket ) {
        try {
            //find correct connect controller
            self.router.findWSRoute( wsInfo, socket, {
                'id': 'connection'
            });
            
            //find correct message controller
            socket.on( 'message', function( dataRaw ) {
                //parse JSON if it is in the notation otherwise pass it as is
                var data;
                try {
                    data = JSON.parse( dataRaw );
                } catch ( e ) {
                    data = dataRaw;
                }
                
                self.router.findWSRoute( wsInfo, socket, data );
            } );
            
            socket.on( 'disconnect', function() {
                self.router.findWSRoute( wsInfo, socket, {
                    'id': 'disconnect'
                } );
            } );
        } catch( e ) {
            self.catch( e );
        }
    };
};



/*
    Function: catch

        Handle application-wide exceptions

    Returns:

        {Object} Error object
*/
Quasar.prototype.catch = function( err ) {
    var logger = this.get( 'Logger' );
    if ( logger ) {
        logger.log( err );
    } else {
        console.log( err );
        console.log(err.stack)
    }
};


/*
    Function: setViewEngine

        Set a view/templating engine for Quasar to use
        
    Parameters:
        
        engine - refrence to the templating engine object
*/
Quasar.prototype.setViewEngine = function( engine ) {
    this.renderer.setViewEngine( engine );
};