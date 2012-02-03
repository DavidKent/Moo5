/*
*   Route defination in the route configuration file of each individual applet
*   Routes are defined within the context of the the applet
*   
*   i.e  If the applet name is `Blog`, its default route would be `/` 
*/
Routes = module.exports = {
    //the name is important, it is used for url generation in the View
    'inbox': {
        pattern: '',
        controller: 'homeAction'//blog.homeAction
    },
    
    'read_blog_post': {
        pattern: 'posts/:category/:slug',
        controller: 'readPostAction',
        /*
            The requirements are used to parse out the different portions of the request url
            If any of these requirements are not met, then the router will keep looking until it finds one.
            If the request does not find a route that satisfies the requested url, then it is forwarded to the 
            404 error controller.
        */
        requirements: {
            catagory: /\w+/i, // productId must only be 1 or more digits
            slug: /\w+/i, // catogary must only be 1 or more chars
            
            //if no method requirement is specified, all methods will be forwarded to the controller
            _method: [
                'get',
                'post'
             ]
        }
    }
};