var Routes = module.exports = {
    'main': {
        basePattern: '/main',
        applet: 'main'
    },
    
    'inbox': {
        basePattern: '/inbox',
        applet: 'inbox'
    },
    
    'Assets': {
        basePattern: '/public',
        service: 'StaticFileServer'
    }
};