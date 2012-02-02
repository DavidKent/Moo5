/*
*   Route defination in the route configuration file of each individual applet
*   Routes are defined within the context of the the applet
*   
*   i.e  If the applet name is `Blog`, its default route would be `/` 
*/
Routes = module.exports = {
    //the name is important, it is used for url generation in the View
    'logIn': {
        pattern: '/login',
        controller: 'logIn',
    },
    
    'register': {
        pattern: '/register',
        controller: 'register',
    },
    
    'home': {
        pattern: '',
        controller: 'homeAction'//blog.homeAction
    }
    
    
};