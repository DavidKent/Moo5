/*
*   Route defination in the route configuration file of each individual applet
*   Routes are defined within the context of the the applet
*   
*   i.e  If the applet name is `Blog`, its default route would be `/` 
*/
Routes = module.exports = {
    'sendMessage': {
        pattern: '/sendMessage',
        controller: 'sendMessage'
    },
    'deleteMessage': {
        pattern: '/deleteMessage',
        controller: 'deleteMessage'
    },
    'inbox': {
        pattern: '',
        controller: 'homeAction'
    }
};