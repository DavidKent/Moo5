/*
*   Configurations
*/

var Config = module.exports = {

    PROTOCOL: 'http',
    
    //used for generation of paths
    PUB_HOST: 'localhost',
    
    //HOST: '192.168.1.154',
    
    PORT: 8089,
    
    
    
    ENV: 'dev',//'prod'
    
    /*
        Location of the "applets" directory, used for autoloading applets
    */
    APPLETS_DIR: __dirname + '/applets/',

    LOG_DIR: __dirname + '/logs/',
    
    PUBLIC_DIR: __dirname + '/public/',

    DEBUG_ENV: ['dev'], //show errors and debug information to user in these specified enviroments
    
    ENABLE_WS: true
};
