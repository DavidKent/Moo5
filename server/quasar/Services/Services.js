/*
    Function: Services

        Services object constructor
*/
var Services = module.exports = function() {
    this._services = {};
};



/*
    Function: add

        Add the the given service as the given name internally so it may be requested later.
        
    Parameters:
        
        name - {String} A string handle for the service being added
        obj - {Object} The instance of the object being added

    See Also:

        <get>
*/
Services.prototype.add = function( name, obj ) {    
    this._services[ name ] = obj;
};



/*
    Function: get

        Return a refrence to requested service
        
    Parameters:
        
        name - {String} A string handle for the service being requested

    Returns:

        {Object} Requested service or undefined if none exist by that handle
        
    See Also:

        <add>
*/
Services.prototype.get = function( name ) {
    return this._services[ name ];
};