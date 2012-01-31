var http = require( 'http' );
var https = require( 'https' );
var cluster = require( 'cluster' );

/*
   Function: Server

   Server object constructor

   Parameters:

      quasar - Refrence to the application Quasar object
      request_handler - Function to call for every client request. The parameters Request and Response are passed to the callback
*/
var Server = module.exports = function( quasar, requestHandler ) {
    this._serverInitialized = false;
    
    this._quasar = quasar;
    this._config = quasar.config;
    this._requestHandler = requestHandler;
};



/*
   Function: setRequestHandler

   Set the request handler for the server if it is not passed with the object constructor

   Parameters:

      fn - Request handler function
*/
Server.prototype.setRequestHandler = function( fn ) {
    this._requestHandler = fn;
};



/*
   Function: start

   Start the server

   Parameters:

      fn - function to call when server has started

   See Also:

      <stop>
*/
Server.prototype.start = function( fn ) {
    if ( !this._server_initialized ) {
        var protocol = this._config.PROTOCOL.toLowerCase();
        if ( protocol === 'http' ) {
            this._webServer = http.createServer( this._requestHandler );
            this._isSecure = false;
        } else if ( protocol === 'https' ) {
            this._webServer = https.createServer( { key: this._config.TLS_KEY, cert: this._config.TLS_CERT }, this._requestHandler );
            this._isSecure = true;
        }
        this._serverInitialized = true;
    }
    
    var serverManager = this._quasar.get( 'ServerManager' );
    if ( serverManager ) {
        serverManager.use( this._webServer, fn );
    } else {
        this._webServer.listen( this._config.PORT, this._config.HOST, fn );
    }
};



/*
   Function: stop

   Stop the server from accepting any new connections

   See Also:

      <start>
*/
Server.prototype.stop = function() {
    this._webServer.close();
};



/*
   Function: isSecure

   Returns a boolean value indicated whether or not the server is a secure one. i.e HTTPS or HTTP
*/
Server.prototype.isSecure = function() {
    return this._isSecure;
};

/*
   Function: getNativeServer
      Get a refrence to the native HTTP/HTTPS server object
   Returns:

        {Object} - Native server object
*/
Server.prototype.getNativeServer = function() {
    return this._webServer;
};