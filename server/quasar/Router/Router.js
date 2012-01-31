/*
    Function: Router

    Router object constructor

    Parameters:

        quasar - Refrence to the current instance of the Quasar object
*/
var Router = module.exports = function( quasar ) {
    this._quasar = quasar;
    this._routes = {};
    this._wsRoutes = {};
    this._serviceRoutes = {};
    
    this._serviceHandlers = {};
    
    this._routeRules = {
        '_method': this._methodDirective,
        '_transport': this._transportRule
    };
};



/*
    Function: buildRoutes

        Build routing patterns for all available applets
*/
Router.prototype.buildRoutes = function() {
    var allAppletsRaw = this._quasar.getAllRawApplets();
    var appRoutes = this._quasar.getAppRoutes();
    
    for ( var appRoute in appRoutes ) {
        if ( allAppletsRaw[ appRoute.applet ] === undefined ) {
            //check if route is registered to a service
            var thisRoute = appRoutes[ appRoute ];
            if ( thisRoute.service !== undefined ) {
                this._serviceRoutes[ thisRoute.basePattern ] = {
                    'handler': this._serviceHandlers[ thisRoute.service ],
                    'service': this._quasar.get( thisRoute.service )
                };
                continue;
            }
        }

        var appletBasePattern = appRoutes[ appRoute ].basePattern;
        
        var routes = allAppletsRaw[ appRoute ].routes;
        
        var applet = {
            object: new allAppletsRaw[ appRoute ].object( this._quasar ),
            appletProto: allAppletsRaw[ appRoute ]
        };
        
        //register the instance of the applet and name with quasar
        this._quasar.addApplet( appRoute, applet );

        appRoutes[ appRoute ].requirements = appRoutes[ appRoute ].requirements || {};

        //if the route is for websocket connections, there is no need to create normal routes for it
        if ( ( appRoutes[ appRoute ].requirements._transport || '' ).toLowerCase() === 'ws' ) {
            this._buildWSRoute( appRoutes[ appRoute ] );
            continue;
        }
        
        for ( var route in routes ) {
            if ( typeof routes[ route ].pattern !== 'string' ) {
                throw Error( 'name: "Bad Route", description: "Expecting applet route rule to be of type `String`"' );
            }

            routes[ route ].requirements = routes[ route ].requirements || {};
             
            //parse for route parameters
            var params = routes[ route ].pattern.match( /:\w+/g ) || [];
            var tempExp = routes[ route ].pattern;
            for ( var i = 0, len = params.length; i < len; ++i ) {
                var param = params[ i ].substr( 1 );
                
                // if a reqirement rule exists for the param, use it, otherwise, use /.*/
                var paramRule;
                if ( routes[ route ].requirements.hasOwnProperty( param ) ) {
                    paramRule = routes[ route ].requirements[ param ];
                    if ( !paramRule instanceof RegExp ) {
                        throw Error( 'name: "Bad Route", description: "Expecting parameter variable rule to be of type `RegExp`"' );
                    }
                    paramRule = '(' + paramRule.source + ')';
                } else {
                    paramRule = '(.*';
                }
                tempExp.replace( /:\w+/, paramRule );
            }
            
            var controller = routes[ route ].controller;
            routes[ route ]._patternRegex = new RegExp( appletBasePattern + tempExp, 'g' );
            
            //action controller function
            routes[ route ]._actionController = applet.object[ controller ];
            
            //refrence to instance of applet object
            routes[ route ]._applet = applet.object
            routes[ route ]._fullRoute = appletBasePattern + routes[ route ].pattern;
            
            //applet base route
            routes[ route ]._baseRoute = appRoutes[ appRoute ];
            
            this._routes[ route ] = routes[ route ];
        }
    }
};



/*
    Function: rebuildRoutes

        Rebuilds application route rules. Call this if application's routes are changed
            post startup.
    
    Parameters:
    
        appRoute - {Object} refrence to the app route object
*/
Router.prototype.rebuildRoutes = function() {
    this._routes = {};
    this._serviceRoutes = {};
    this._wsRoutes = {};
    this.buildRoutes();
};


/*
    Function: _buildWSRoute

        Create routes (callbacks for given event name) for a given websocket route 
    
    Parameters:
    
        appRoute - {Object} refrence to the app route object
*/
Router.prototype._buildWSRoute = function( appRoute ) {
    var allAppletsRaw = this._quasar.getAllRawApplets();
    var wsRoutes = this._wsRoutes[ appRoute.applet ] = {
        'applet': appRoute.applet,
        'path': appRoute.basePattern,
        'routes': {}
    };
    
    var routes = appRoute.routes;
    var applet = allAppletsRaw[ appRoute.applet ];
    
    for ( var route in routes ) {
        wsRoutes.routes[ route ] = applet[ routes[ route ].controller ];
    }
};




/*
    Function: findRoute

        Find the appropriate controller for the incoming client request
        
    Parameters:
    
        request - {Object} Client's Request object
        response - {Object} Client's Response object
*/
Router.prototype.findRoute = function( request, response ) {
    var basePath = request.getBasePath();
    var routeFound = false;
    var rules = Object.keys(this._routeRules);
    var route;
    
    //test for service routes
    for ( route in this._serviceRoutes ) {
        if ( basePath === route ) {
            var serviceRoute = this._serviceROutes[ route ];
            serviceRoute.handler.apply( serviceRoute.service, request, response );
            routeFound = true;
        }
    }
    
    //test for normal routes
    if ( !routeFound ) {
        for ( routeName in this._routes ) {
            route = this._routes[ routeName ];
            if ( !route._patternRegex.test( basePath ) ) {
                continue;
            }
            
            //make sure request matches this route's requirements
            var ruleResult = true;
            for ( var i = 0, len = rules.length; i < len; ++i ) {
                var ruleName = rules[i];
                var rule = route.requirements[ ruleName ] || route._baseRoute.requirements[ ruleName ];
                if ( rule ) {
                    ruleResult = this._routeRules[ ruleName ]( request, rule );
                }
            }
            
            //one or more of the route rules did not match
            if ( ruleResult === false ) {
                continue;    
            }
                
            var params = route._patternRegex.exec( basePath ) || [];
            var applet = route._applet;
            params.unshift( request, response );
            
            request.setRouteObject( route );
            
            //call action controller
            var actionController = route._actionController;
            actionController.apply( applet, params );
            routeFound = true;
            //route found.. break loop
            break;
        }
    }
    
    
    if ( routeFound === false ) {
        this.routeNotFound( request, response );    
    }
};



/*
    Function: findWSRoute

        Find the appropriate controller for the WebSocket event
        
    Parameters:
    
        wsInfo - {Object} Refrence to winsocket info object
        socket - {Object} Refrence to the websocket object
        data - {Object} Refrence to data recieved from client
*/
Router.prototype.findWSRoute = function( wsInfo, socket, data ) {
    var routeFound = false;
    var paths = this._wsRoutes[ wsInfo.applet ].paths;
    
    for ( var path in paths ) {
        if ( path === data.id ) {
            var allApplets = this._quasar.getAllApplets();
            var applet = allApplets[ wsInfo.applet ].object;
            
            // call action controller
            paths[ path ].apply( applet, socket, data );
            
            routeFound = true;
            break;
        }
    }
    
    if( !routeFound ) {
        wsRouteNotFound( socket, data);
    }
};




/*
    Function: generateUrl

        Generate url based on the route name and specified URL parameters
    
    Parameters:
    
        routeName - {String} Name of the route based which to generate the URL
        params - {Object} Object literal containing name and values for URL parameters

    Returns
        {String} Generated URL
*/
Router.prototype.generateUrl = function( routeName, params ) {
    var route = this._routes[ routeName];
    
    if ( route === undefined) {
        throw Error( 'Name: "Bad Route Name", Description, "Specified route name is not in any route files"' );
    }
    
    var config = this._quasar.config;
    var fullRoute =  this._routes[ routeName ]._fullRoute;
    for ( var param in params ) {
        if ( !params.hasOwnProperty( param ) ) {
            continue;    
        }
        
        fullRoute.replace( ':' + param, params[ param ]);
    }
    
    return config.PROTOCOL + '://' + config.PUB_HOST + route._fullRoute;
};




/*
    Function: _methodRule

        Test for the _method route rule
    
    **Access - private
    
    Parameters:
    
        request - {Object} Instance of request objecr for the current request
        rule - {Array|String} value of rule as specified in the route file

    Returns
        {Boolean} True if the rule requrements are met, otherwise false
*/
Router.prototype._methodRule = function( request, rule ) {
    var method = request.getMethod();
    if ( rule instanceof Array ) {
        if ( rule.indexOf( method ) !== -1 ) {
            return true;
        }
    } else if ( typeof rule === 'string' ) {
        if ( rule === method ) {
            return true;
        }
    }
    return false;
};




/*
    Function: _transportRule

        Test for the _transport route rule
    
    Parameters:
    
        request - {Object} Instance of request objecr for the current request
        rule - {Array|String} value of rule as specified in the route file

    Returns
        {Boolean} True if the rule requrements are met, otherwise false
*/
Router.prototype._transportRule = function( request, rule ) {
    var transport = request.getTransport();
    if ( rule instanceof Array ) {
        if ( rule.indexOf( transport ) !== -1 ) {
            return true;    
        }
    } else if ( typeof rule === 'string' ) {
        if ( rule === transport ) {
            return true;    
        }
    }
    
    return false;
};



/*
    Function: getWSRoutes

        Get a refrence to the object holding the routes for websockets

    Returns
        {Object} Refrence to WS routes object
*/
Router.prototype.getWSRoutes = function() {
    return this._wsRoutes;    
};



/*
    Function: setServiceHandler

        Set a function as the request handler for a given service. If a route is registered to 
            the specified service, then this function will be called with an instance of 
            the Request and Response objects

    Parameters
        name - {Object} Name of the service
        fn - {Function} listener function to be used as the request handler
*/
Router.prototype.setServiceHandler = function( name, fn ) {
    this._serviceHandlers[ name ] = fn;
}




/*
    Function: routeNotFound

        Method called by router if no route is found for the request

    Parameters:

        request - {Object} instance of Request object
        response - {Object} instance of the Response object
*/
Router.prototype.routeNotFound = function( request, response ) {
    // give 404 error
    response.setStatusCode(404)
    response.setContent('<html><head></head><body><h1>404</h1></body></html>');
    response.send();
};



/*
    Function: wsRouteNotFound

        Method called by router if no route is found for the request

    Parameters:

        socket - {Object} Refrence to client's socket object
        data - {Object} refrence to object holding data
*/
Router.prototype.wsRouteNotFound = function( socket, data ) {
    socket.send(JSON.stringify({status: '404'}));
};



/*
    Function: addRouteRequirement

        Add 

    Parameters:

        name - {String} Name of route rule
        data - {Object} refrence to object holding data
*/
Router.prototype.addRouteRequirement = function( name, fn ) {
    this._routeRules[ '_' + name ] = fn;
};