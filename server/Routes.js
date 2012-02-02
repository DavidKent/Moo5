var Routes = module.exports = {
    'main': {
        basePattern: '/main',
        applet: 'main'
    },
    
    'Inbox': {
        basePattern: '/Inbox',
        applet: 'Inbox'
    },
    
    'Assets': {
        basePattern: '/public',
        service: 'StaticFileServer'
    }
};