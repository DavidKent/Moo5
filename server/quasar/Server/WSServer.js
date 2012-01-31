var ws = require( 'ws' );


/*
    Function: WSServer

        WSServer object constructor

    Parameters:

        quasar - {Object} Refrence to application's Quasar object
        wsInfo - {Object} Object containing
        requestHandler - {Function} Fn to call for every client connect. Refrence
            to `socket` object is passed to the callback
*/
var WSServer = module.exports = function( quasar, wsInfo, requestHandler ) {
    this._wss = new ws.Server({
        'server': quasar.server.getNativeServer(),
        'path': wsInfo.path
    });
    
    this._wss.on('connection', function( ws ) {
        requestHandler( wsInfo, ws );
    });
};


/*
    Function: stop

    Close connection to all connected clients and shutdown WS server

    Parameters:

       code - {String} disconnect code
       data - {String} data to be passed to client
*/
WSServer.prototype.stop = function( code, data ) {
    this._wss.close( code, data );
};