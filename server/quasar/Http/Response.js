var Cookie = require( './Cookie.js' );

/*
    Function: Response

        Response object constructor

    Parameters:

        res - Native node response object
*/
var Response = module.exports = function( res ) {
    this._response = res;
    
    this._cookies = {};
    //default content type
    this._contentType = 'text/html';
    
    this._cacheControl = {};
    
    this._encoding = 'utf8';
    
    this._charset = 'UTF-8';
    
    this._response.statusCode = 200;
};



/*
    Function: toString

        Creates a string represnetaion of the response object including both 
            content and header sections
    
    returns:
    
        String representation of HTTP response
    
*/
Response.prototype.toString = function() {
    if ( !this._content ) {
        this._content = JSON.stringify( this._response );
    }
    return this._responseString;
};



/*
    Function: getNativeResponse
    
        Exposes the native Node response object
    
    returns:
    
        {Object} Native Node esponse object
*/
Response.prototype.getNativeResponse = function() {
    return this._response;    
};




/*
    Function: getAge

        Get age of the response
    
    returns:
    
        {Number | undefined} Header's value as a type Number, if none is found 
            then `undefined` is returned
*/
Response.prototype.getAge = function() {
    var age;
    if ( this.get( 'Age' ) !== undefined ) {
        age = this.get( 'Age' ) >> 0;
    }
    return age;
};



/*
    Function: getEncoding

        Get the name of the encoding
    
    returns:
    
        {String} encoding
*/
Response.prototype.getEncoding = function() {
    return this._encoding;
};



/*
    Function: setEncoding

        Change the value of the response's encoding, default is `utf8`
        
    Parameters:
    
        encoding - {String} encoding to use
*/
Response.prototype.setEncoding = function( encoding ) {
    this._encoding = encoding;
};



/*
    Function: getContent

        Get content of the response object
    
    returns:
    
        {String} Content of response object
*/
Response.prototype.getContent = function() {
    return this._content;
};


/*
    Function: setDate

        Set the value of the `Date` HTTP header
    
    parameters:
    
        date - {Date} value to set as the value of `Date` header
*/
Response.prototype.setDate = function( date ) {
    this.setHeaderDate( date);
};



/*
    Function: getDate

        Get a Date object with the value of the `Date` HTTP header
    
    returns:
    
        {Date} value of `Date` header
*/
Response.prototype.getDate = function() {
    return this.getHeaderDate( 'Date' );
};



/*
    Function: getHeaderDate

        Get the value of a HTTP header as a Date object.. if it is a valid representaion of a date
        
    Parameters:
    
        header - {String} Name of http header for which to get date value
        defaultValue - {Date} Date object to be returned incase the specified HTTP header
            does not exist or is empty
    
    returns:
    
        {Date} Requested date
*/
Response.prototype.getHeaderDate = function( header, defaultValue ) {
    var date = this.get( header );
    if ( !date ) {
        return defaultValue;
    }
    date = Date.parse( date );
    if ( isNaN( date ) ) {
        throw Error( 'name: "Bad  Date", description: "Cannot parse malformed date representation"' );
    }
    
    return new Date( date );
};



/*
    Function: setHeaderDate

        Set the value of the specified header to the value of the specified Date object (UTC representation)
        
    header - {String} Name of header field
    date - {Date} date value
*/
Response.prototype.setHeaderDate = function( header, date ) {
    this.setHeader( header, date.toUTCString() );
};



/*
    Function: getEtag

        Get the value of the Etag header value
    
    returns:
    
        {String} value of `Etag` HTTP header
*/
Response.prototype.getEtag = function() {
    return this.getHeader( 'Etag' );
};



/*
    Function: getExpires

        Get the value of the `Expires` header as a Date object
    
    returns:
    
        {Date} Response expiration date
*/
Response.prototype.getExpires = function() {
    return this.getHeaderDate( 'Expires' );
};


/*
    Function: getMaxAge

        Get the maximum time after which the response will be considered stale as a Date object.
            First, it checks for a `s-maxage` directive, then a `max-age` directive, and then it falls
            back on an `expires` header. `undefined` is returned when no maximum age can be established.
    
    returns:
    
        String representation of HTTP response
*/
Response.prototype.getMaxAge = function() {
    var age;
    if ( (age = getCacheControlDirective('s-maxage')) !== null ) {
        return age;    
    }
    
    if ( (age = getCacheControlDirective( 'max-age' )) !== null ) {
        return age;
    }
    
    return this.getExpires();
};


/*
    Function: getStatusCode

        Get the response's HTTP status code
    
    returns:
    
        {Number} Status code
*/
Response.prototype.getStatusCode = function() {
    return this._response.statusCode;
};




/*
    Function: getVary

        Get the vary HTTP header's values in an array 
        
    returns:
    
        {Array} vary values
*/
Response.prototype.getVary = function() {
    var vary = this.get( 'Vary' ) || '';

    return vary.split( ', ' );
};



/*
    Function: setVary

        Set the `vary` header
        
    Parameters:
        headers - {Array | String} An Array or String containing list of headers.
            if it is a string then the headers must be comma seperated
*/
Response.prototype.setVary = function( headers ) {
    this.set( 'Vary', headers.join( ', ' ) );
};



/*
    Function: isCachable

        Determin if the response is cachable

    Returns:
        {Boolean} is response cachable
*/
Response.prototype.isCachable = function() {
    
};



/*
    Function: isFresh

        Determine if the response is fresh
        
    Returns
    
        {Boolean} True if it is fresh, otherwise false
*/
Response.prototype.isFresh = function() {
    return this.getTtl > 0;
};



/*
    Function: isValidateable

        Determine if the response includes headers that can be used to validate
            the response with the origin server using a conditional GET request.
            
    Returns:
    
        {Boolean} True if response is validateable otherwise, false
*/
Response.prototype.isValidateable = function() {
    if ( this.getHeader( 'Last-Modified' )  !== undefined || this.getHeader( 'ETag' ) !== undefined ) {
        return true;
    } else {
        return false;
    }
};


/*
    Function: setClientTtl

        Set the time to live for the Response's private cache. This method sets the 
            Cache-Control and max-age directives
        
    Parameters:
        seconds - {Number} Set the number of seconds (added to the existing age) should 
            the private TTL be set to 
*/
Response.prototype.setPrivateTtl = function( seconds ) {
    var age = this.getAge() >>> 0;
    this.setMaxAge( age + seconds );
};


/*
    Function: setTtl

        Set the time to live for the Response's shared cache. This method sets the 
            Cache-Control and s-maxage directives
        
    Parameters:
        seconds - {Number} Set the number of seconds (added to the existing age) 
            should the shared TTL be set to 
*/
Response.prototype.setTtl = function( seconds ) {
    var age = this.getAge() >>> 0;
    this.setSharedMaxAge( age + seconds );
};


/*
    Function: setContent

        Set the response content
        
    Parameters:
    
        content - {String} String containing content
*/
Response.prototype.setContent = function( content ) {
    this._content = content;
};



/*
    Function: setEtag

        Set the ETag header

    Parameters:

        value - {String} value to be set for the ETag header
        weak - {Bool} boolean value indicating it is a weak Etag
*/
Response.prototype.setETag = function( value, weak ) {
    if ( value === undefined ) {
        this.removeHeader( 'Etag' );    
    } else {
        if ( value[0] !== '"' ) {
            value = '"' + value + '"';
        }
        if ( weak === true ) {
            value = 'W/' + value;
        }
        
        this.setHeader( 'Etag', value)
    }
};



/*
    Function: setExpires

        Set the vlaue of the `Expires` HTTP header.
        
    Parameters:
    
        date - {Date} Date object containing the time value to be set
*/
Response.prototype.setExpires = function( date ) {
    if ( date === undefined ) {
        this.removeHeader( 'Expires' );
    } else {
        this.setHeaderDate( 'Expires', date );
    } 
};



/*
    Function: setExpired

        Marks the response stale by setting the Age header to be equal to the maximum age of the response.
*/
Response.prototype.setExpired = function() {
    if ( this.isFresh() ) {
        this.set( 'Age', this.getMaxAge() );
    }
};



/*
    Function: setLastModified

        Set the value of the `Last-Modified` HTTP header with the specified Date object
        
    Parameters
        date - {Date} Instance of Date object holding date-time to be set as the last modified header
*/
Response.prototype.setLastModified = function( date ) {
    if ( !date ) {
        this.remove( 'Last-Modified' );
    } else {
        this.setHeaderDate( 'Last-Modified', date );
    }
};





/*
    Function: setMaxAge

        Sets the number of seconds after which the response should no longer be considered fresh.
*/
Response.prototype.setMaxAge = function( value ) {
    this.addCacheControlDirective( 'max-age', value );
};




/*
    Function: setSharedMaxAge

        Sets the number of seconds after which the response should no longer be 
            considered fresh by shared caches.
            This methods sets the Cache-Control s-maxage directive.
            
    Parameters:
        value - {Number} Number of seconds
*/
Response.prototype.setSharedMaxAge = function( value ) {
    this.setPublic();
    this.addCacheControlDirective( 's-maxage', value );
};



/*
    Function: setNotModified

        Set the response as a not modified (304). Will remove any HTTP headers that 
        might contradict this: 'Allow', 'Content-Encoding', 'Content-Language',
        'Content-Length', 'Content-MD5', 'Content-Type', 'Last-Modified'
*/
Response.prototype.setNotModified = function() {
    this.setStatusCode( 304 );
    this.setContent( '' );
    
    var headersNotAllowed = [ 'Allow', 'Content-Encoding', 'Content-Language',
        'Content-Length', 'Content-MD5', 'Content-Type', 'Last-Modified' ];
    for ( var i = 0, len = headersNotAllowed.length; i < len; i ++) {
        this._response.removeHeader( headersNotAllowed[i] );
    }
};



/*
    Function: setPrivate

        Set reponse as private. This makes the response ineligible for serving other clients.
*/
Response.prototype.setPrivate = function() {
    this.removeCacheControlDirective( 'public' );
    this.addCacheControlDirective( 'private' );
};



/*
    Function: setPublic

        Set reponse as public. This makes the response eligible for serving other clients.
*/
Response.prototype.setPublic = function() {
    this.removeCacheControlDirective( 'private' );
    this.addCacheControlDirective( 'public' );
};



/*
    Function: setProtocolVersion

        Set the protoccol version of the response
*/
Response.prototype.setProtocolVersion = function() {
    
};



/*
    Function: setStatusCode
    
        Set HTTP status code to response
    
    Parameters:
        status - {Number} Status code
*/
Response.prototype.setStatusCode = function( status ) {
    this._response.statusCode = status;
};



/*
    Function: send

        Send headers + content to client thus ending the client's request
*/
Response.prototype.send = function() {
    //setup response cookies
    var cookies = [];
    for ( var cookie in this._cookies ) {
        if ( !this._cookies.hasOwnProperty( cookie ) ) {
                
        }
        cookies.push( this._cookies[ cookie ].toString() );
    }
    
    this._response.setHeader('Set-Cookie', cookies);
    this._response.setHeader('Content-Type', this._contentType);
    this._response.end( this._content, this._encoding );
};



/*
    Function: _getCacheControlHeader

        Get the value of the `Cache-Control` header
        
    Return:
        Cache-Control header value
*/
Response.prototype._getCacheControlHeader = function() {
    var parts = [];
    for ( var directive in this._cacheControl ) {
        if( !this._cacheControl.hasOwnProperty(directive) ) {
            continue;    
        }
        var value = this.cacheControl[ directive ];
        if ( value === true ) {
            parts.push( directive );
        } else {
            if( /[^a-zA-Z0-9._-]/.test( value ) ) {
                value = '"' + value + '"';
            }
            parts.push( directive + '=' + value );
        }
    }
    
    return parts.join(', ');
};



/*
    Function: addCacheControlDirective

        Add a cache directive to `Cache-Control` header
        
    Parameters:
        
        directive - {String} 
        value - {String} Optional, value for cache directive
        
    Return:
        Cache-Control header value
*/
Response.prototype.addCacheControlDirective = function( directive, value ) {
    if ( value === undefined ) {
        value = true;
    }
    this._cacheControl[ directive ] = value;
    
    this._updateCacheControl();
};



/*
    Function: removeCacheControlDirective

        Remove a cache directive to `Cache-Control` header
        
    Parameters:
        
        directive - {String} name of directive to remove form header
        value - {String} Optional, value for cache directive
*/
Response.prototype.removeCacheControlDirective = function( directive ) {
    delete this._cacheControl[ directive ];
    
    this._updateCacheControl();
};



/*
    Function: getCacheControlDirective

        Remove a cache directive to `Cache-Control` header
        
    Parameters:
        
        directive - {String} name of directive to get
        
    Returns:
    
        {String} Value of specified directive
*/
Response.prototype.getCacheControlDirective = function( directive ) {
    return this._cacheControl[ directive ];
};



/*
    Function: _updateCacheControl

        Updates the `Cache-Control` header to user specified properties using Response's methods 
*/
Response.prototype._updateCacheControl = function() {
    this.set( 'Cache-Control', this._getCacheControlHeader() );
};



/*
    Function: isNotModified

        Determines if the Response validators (ETag, Last-Modified) matches a conditional 
            value specified in the Request. If the response is not modified, it sets the 
            status code to 304 and removes the response content by calling the `setNotModified` method
        
    Parameters:
        request - {Object} Instance of the Request object which represents the client
        
    Returns
    
        {Boolean} True if the request and response cache validators match, otherwise false
*/
Response.prototype.isNotModified = function( request ) {
    var lastModified = request.get( 'If-Modified-Since' );
    var notModified = false;
    var etag = request.getEtag();
    
    if ( !etag ) {
        notModified = ( ~etags.indexOf( this.getEtag() ) || ~etags.indexOf( '*' ) ) && ( !lastModified || this.getDate( 'Last-Modified' ).valueOf() === lastModified.valueOf() );
    } else if ( lastModified ) {
        notModified = lastModified.valueOf() === this.get( 'Last-Modified' ).valueOf();
    }
    
    if ( setNotModified ) {
        this.setNotModified();
    }
    
    return notModified;
};


/*
    Function: isInvalid

        Determine if the response is invalid by looking at the status code
        
    Returns:
        
        {Boolean} is response invaid?
*/
Response.prototype.isInvalid = function() {
    return this.statusCode() < 100 || this.statusCode() >= 600;
};


/*
    Function: isInformational

        Determine if the response is informative by looking at the status code
        
    Returns:
        
        {Boolean} Is response informative?
*/
Response.prototype.isInformational = function() {
    return this.statusCode() >= 100 && this.statusCode() < 200;
};



/*
    Function: isSuccessful

        Determine if the response is successful by looking at the status code
        
    Returns:
        
        {Boolean} is response successful?
*/
Response.prototype.isSuccessful = function() {
    return this.statusCode() >= 200 && this.statusCode() < 300;
};



/*
    Function: isRedirection

        Determine if the response is a redirect by looking at the status code
        
    Returns:
        
        {Boolean} is response a redirect?
*/
Response.prototype.isRedirection = function() {
    return this.statusCode() >= 300 && this.statusCode() < 400;
};


/*
    Function: isClientError

        Determine if the response is a client error by looking at the status code
        
    Returns:
        
        {Boolean} is response a client error?
*/
Response.prototype.isClientError = function() {
    return this.statusCode() >= 400 && this.statusCode() < 500;
};



/*
    Function: isInvalid

        Determine if the response is a server error by looking at the status code
        
    Returns:
        
        {Boolean} is response a server error?
*/
Response.prototype.isServerError = function() {
    return this.statusCode() >= 500 && this.statusCode() < 600;
};



/*
    Function: isOk

        Determine if the response is OK by looking at the status code
        
    Returns:
        
        {Boolean} is response OK?
*/
Response.prototype.isOk = function() {
    return this.statusCode() === 200;
};



/*
    Function: isForbidden

        Determine if the response is forbidden by looking at the status code
        
    Returns:
        
        {Boolean} is response forbidden?
*/
Response.prototype.isForbidden = function() {
    return this.statusCode() === 403;
};



/*
    Function: isNotFound

        Determine if the response is a `not found` by looking at the status code
        
    Returns:
        
        {Boolean} is response invaid?
*/
Response.prototype.isNotFound = function() {
    return this.statusCode() === 404;
};


/*
    Function: isEmpty

        Determine if the response is empty by looking at the status code
        
    Returns:
        
        {Boolean} is response invaid?
*/
Response.prototype.isEmpty = function() {
    return ( this.statusCode() === 201 || this.statusCode() === 204 || this.statusCode() === 304 );
};




/*
    Function: set

        Set HTTP header and it's value
        
    Parameters:
        
        header - {String} HTTP Header name
        value - {String} Header value
*/
Response.prototype.set = function( header, value ) {
    this._response.setHeader( header, value );
};



/*
    Function: get

        Get the specified HTTP header's value
        
    Parameters:
        
        header - {String} HTTP Header name
        
    Returns:
    
        {String} Specified Header's value
*/
Response.prototype.get = function( header ) {
    return this._response.getHeader( header );
};



/*
    Function: remove

        Remove the specified HTTP header
        
    Parameters:
        
        header - {String} HTTP Header name
*/
Response.prototype.remove = function( header ) {
    this._response.removeHeader( header );
};




/*
    Function: setCookie

        Set a cookie by passing in its properties, including it's name. 
            see <Cookie> for the supported properties
        
    Parameters:
        
        properties - {Object} Properties/directives of the cookie
*/
Response.prototype.setCookie = function( properties ) {
    if ( !properties.name ) {
        throw Error( 'name: "Bad Cookie", description: "Function requires valid cookie name"' );
    }
    this._cookies[ properties.name ] = new Cookie( properties );
};



/*
    Function: getCookie

        Get the specified cookie as a `Cookie` object
        
    Parameters:
        
        name - {String} Name of cookie
        
    Returns:
    
        {Cookie} requested cookie
*/
Response.prototype.getCookie = function( name ) {
    return this._cookies[ name ];
};



/*
    Function: render

        Render the response and end the response.
*/
Response.render = function() {
    var renderer = this._quasar.getViewEngine();
    var content = this._quasar.renderer.render();
    
};


/*
    Function: setContentType

        Set response `Content-Type` header's value. Quasar, by default sets it to text/html
        
    Parameters:
        
        contentType - {String} Value of Content-Type header
*/
Response.prototype.setContentType = function( contentType ) {
    this._contentType = contentType;
};


/*
    Function: getContentType

        Get response `Content-Type` header's value
        
    Returns:
        
        contentType - {String} Value of Content-Type header
*/
Response.prototype.getContentType = function() {
    return this._contentType;
};
//TODO: upgrade to TLS headers